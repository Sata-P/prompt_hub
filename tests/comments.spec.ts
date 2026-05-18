import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockPromptApi, type MockPrompt } from './helpers/mocks';

// Detail-page tests hit the dev server concurrently and parallel workers
// can race the Turbopack first-compile of /prompts/[id]. Serial avoids 30s timeouts.
test.describe.configure({ mode: 'serial' });

const VIEWER_ID = 1;
const OTHER_ID = 99;

type ApiComment = {
  id: number;
  content: string;
  attachment_url: string | null;
  user_id: number;
  prompt_id: number;
  parent_id: number | null;
  created_at: string;
  user: { id: number; name: string; email?: string };
  replies?: ApiComment[];
};

function basePrompt(overrides: Partial<MockPrompt> = {}): MockPrompt {
  return {
    id: 1,
    title: 'Comment Test Prompt',
    description: 'For comment flow tests.',
    status: 'PUBLISHED',
    latest_version_no: 1,
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: '2026-05-01T00:00:00.000Z',
    category: null,
    tags: [],
    recommended_models: [],
    visibility: 'PUBLIC',
    ...overrides,
  };
}

function makeComment(overrides: Partial<ApiComment> = {}): ApiComment {
  return {
    id: 1,
    content: '<p>Hello</p>',
    attachment_url: null,
    user_id: VIEWER_ID,
    prompt_id: 1,
    parent_id: null,
    created_at: '2026-05-10T00:00:00.000Z',
    user: { id: VIEWER_ID, name: 'Viewer User', email: 'viewer@test.local' },
    replies: [],
    ...overrides,
  };
}

/**
 * Wire `/api/prompts/:id` (GET) so the detail page renders, plus the
 * comments collection (`/api/prompts/:id/comments`) and the single-comment
 * route (`/api/comments/:id`). Mutations are captured into an in-memory
 * store so the test can assert against the resulting state.
 */
async function mockCommentFlow(
  page: Page,
  prompt: MockPrompt,
  ownerId: number,
  initialComments: ApiComment[] = [],
) {
  const store: ApiComment[] = JSON.parse(JSON.stringify(initialComments));
  let nextId = 1000;

  await page.route(`**/api/prompts/${prompt.id}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...prompt,
        owner: { id: ownerId, name: 'Owner', email: 'owner@test.local' },
        recommended_models: prompt.recommended_models ?? [],
        versions: [
          {
            id: 1,
            version_no: prompt.latest_version_no,
            template_content: 'Hello {{name}}',
            status: prompt.status,
            created_at: prompt.created_at,
            promptVariables: [],
            creator: { id: ownerId, name: 'Owner' },
          },
        ],
      }),
    }),
  );

  await page.route(`**/api/prompts/${prompt.id}/comments`, async (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(store),
      });
    }
    if (req.method() === 'POST') {
      const body = req.postDataJSON() as {
        content: string;
        parentId?: number;
        attachmentUrl?: string | null;
      };
      const created: ApiComment = {
        id: ++nextId,
        content: body.content,
        attachment_url: body.attachmentUrl ?? null,
        user_id: VIEWER_ID,
        prompt_id: prompt.id,
        parent_id: body.parentId ? Number(body.parentId) : null,
        created_at: new Date().toISOString(),
        user: { id: VIEWER_ID, name: 'Viewer User', email: 'viewer@test.local' },
        replies: [],
      };
      if (created.parent_id) {
        const parent = store.find((c) => c.id === created.parent_id);
        parent?.replies?.push(created);
      } else {
        store.unshift(created);
      }
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
    }
    return route.fallback();
  });

  await page.route(`**/api/comments/*`, async (route) => {
    const id = Number(route.request().url().split('/').pop());
    if (route.request().method() === 'DELETE') {
      const idx = store.findIndex((c) => c.id === id);
      if (idx >= 0) store.splice(idx, 1);
      else {
        for (const c of store) {
          const ri = c.replies?.findIndex((r) => r.id === id) ?? -1;
          if (ri >= 0) c.replies?.splice(ri, 1);
        }
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Comment deleted' }),
      });
    }
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON() as { content: string };
      let updated: ApiComment | undefined;
      for (const c of store) {
        if (c.id === id) { c.content = body.content; updated = c; break; }
        const r = c.replies?.find((r) => r.id === id);
        if (r) { r.content = body.content; updated = r; break; }
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updated),
      });
    }
    return route.fallback();
  });

  return { store };
}

const composer = (page: Page) =>
  page.locator('div[contenteditable="true"].ProseMirror').first();

test.describe('Comment flow — list', () => {
  test('renders empty state when there are no comments', async ({ page }) => {
    await mockPromptApi(page);
    await mockCommentFlow(page, basePrompt(), OTHER_ID, []);

    await page.goto('/prompts/1');

    await expect(
      page.getByText('No comments yet. Be the first to share your thoughts!'),
    ).toBeVisible();
  });

  test('renders existing comments and shows author name', async ({ page }) => {
    await mockPromptApi(page);
    await mockCommentFlow(page, basePrompt(), OTHER_ID, [
      makeComment({
        id: 1,
        user_id: OTHER_ID,
        user: { id: OTHER_ID, name: 'Alice', email: 'alice@test.local' },
        content: '<p>Nice prompt!</p>',
      }),
    ]);

    await page.goto('/prompts/1');

    await expect(page.getByText('Nice prompt!')).toBeVisible();
    await expect(page.getByText('Alice', { exact: true })).toBeVisible();
  });
});

test.describe('Comment flow — create', () => {
  test('typing + Post sends sanitized HTML to the API and inserts the comment', async ({ page }) => {
    await mockPromptApi(page);
    await mockCommentFlow(page, basePrompt(), OTHER_ID, []);

    await page.goto('/prompts/1');

    const editor = composer(page);
    await editor.click();
    await page.keyboard.type('hello there');

    const postBtn = page.getByRole('button', { name: 'Post Comment' });
    await expect(postBtn).toBeEnabled();

    const [req] = await Promise.all([
      page.waitForRequest(
        (r) => /\/api\/prompts\/1\/comments$/.test(r.url()) && r.method() === 'POST',
      ),
      postBtn.click(),
    ]);

    const body = req.postDataJSON() as { content: string; attachmentUrl: string | null };
    expect(body.content).toContain('hello there');
    expect(body.content.toLowerCase()).toContain('<p>');
    expect(body.attachmentUrl).toBeNull();

    await expect(page.getByText('hello there')).toBeVisible();
  });

  test('Post is disabled while the editor is empty', async ({ page }) => {
    await mockPromptApi(page);
    await mockCommentFlow(page, basePrompt(), OTHER_ID, []);

    await page.goto('/prompts/1');

    await expect(page.getByRole('button', { name: 'Post Comment' })).toBeDisabled();
  });
});

test.describe('Comment flow — edit', () => {
  test('owner can edit their own comment and PATCH carries the new content', async ({ page }) => {
    await mockPromptApi(page);
    await mockCommentFlow(page, basePrompt(), OTHER_ID, [
      makeComment({
        id: 7,
        user_id: VIEWER_ID,
        content: '<p>original</p>',
      }),
    ]);

    await page.goto('/prompts/1');

    await expect(page.getByText('original')).toBeVisible();

    await page.getByRole('button', { name: 'Edit', exact: true }).first().click();

    // The inline edit editor is the second contenteditable on the page.
    const editEditor = page.locator('div[contenteditable="true"].ProseMirror').nth(1);
    await editEditor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await page.keyboard.type('edited content');

    const [req] = await Promise.all([
      page.waitForRequest(
        (r) => /\/api\/comments\/7$/.test(r.url()) && r.method() === 'PATCH',
      ),
      page.getByRole('button', { name: 'Save', exact: true }).click(),
    ]);

    const body = req.postDataJSON() as { content: string };
    expect(body.content).toContain('edited content');

    await expect(page.getByText('edited content')).toBeVisible();
  });

  test('non-owner cannot see Edit / Delete on a comment they do not own', async ({ page }) => {
    await mockPromptApi(page);
    await mockCommentFlow(page, basePrompt(), OTHER_ID, [
      makeComment({
        id: 8,
        user_id: OTHER_ID,
        user: { id: OTHER_ID, name: 'Alice', email: 'alice@test.local' },
        content: '<p>not yours</p>',
      }),
    ]);

    await page.goto('/prompts/1');

    await expect(page.getByText('not yours')).toBeVisible();
    // Reply is still available; Edit and Delete must not be.
    await expect(page.getByRole('button', { name: 'Reply', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Delete', exact: true })).toHaveCount(0);
  });
});

test.describe('Comment flow — delete', () => {
  test('confirm + delete sends DELETE and removes the comment from the list', async ({ page }) => {
    await mockPromptApi(page);
    await mockCommentFlow(page, basePrompt(), OTHER_ID, [
      makeComment({ id: 9, user_id: VIEWER_ID, content: '<p>doomed</p>' }),
    ]);

    await page.goto('/prompts/1');
    await expect(page.getByText('doomed')).toBeVisible();

    await page.getByRole('button', { name: 'Delete', exact: true }).first().click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/cannot be undone/i);

    const [req] = await Promise.all([
      page.waitForRequest(
        (r) => /\/api\/comments\/9$/.test(r.url()) && r.method() === 'DELETE',
      ),
      dialog.getByRole('button', { name: 'Delete', exact: true }).click(),
    ]);

    expect(req.method()).toBe('DELETE');
    await expect(page.getByText('doomed')).toHaveCount(0);
  });

  test('cancelling the confirm dialog does NOT send DELETE', async ({ page }) => {
    await mockPromptApi(page);
    await mockCommentFlow(page, basePrompt(), OTHER_ID, [
      makeComment({ id: 10, user_id: VIEWER_ID, content: '<p>safe</p>' }),
    ]);

    await page.goto('/prompts/1');

    let deleteCount = 0;
    page.on('request', (r) => {
      if (r.method() === 'DELETE' && /\/api\/comments\/10$/.test(r.url())) deleteCount++;
    });

    await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
    const dialog = page.getByRole('alertdialog');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();

    await page.waitForTimeout(200);
    expect(deleteCount).toBe(0);
    await expect(page.getByText('safe')).toBeVisible();
  });
});

test.describe('Comment flow — reply', () => {
  test('reply opens an inline editor and posts with parentId set', async ({ page }) => {
    await mockPromptApi(page);
    await mockCommentFlow(page, basePrompt(), OTHER_ID, [
      makeComment({
        id: 11,
        user_id: OTHER_ID,
        user: { id: OTHER_ID, name: 'Alice', email: 'alice@test.local' },
        content: '<p>parent</p>',
      }),
    ]);

    await page.goto('/prompts/1');
    await expect(page.getByText('parent')).toBeVisible();

    // Toggle the reply form open (this is the only "Reply" before opening).
    await page.getByRole('button', { name: 'Reply', exact: true }).click();

    // The reply editor mounts after the toggle — composer is the first
    // contenteditable on the page, reply editor is the second.
    const replyEditor = page.locator('div[contenteditable="true"].ProseMirror').nth(1);
    await replyEditor.click();
    await page.keyboard.type('a reply');

    // Scope the submit button to the inline form (Cancel + Reply combo).
    const replyForm = page
      .locator('div.max-w-md')
      .filter({ has: page.getByRole('button', { name: 'Cancel', exact: true }) })
      .filter({ has: page.getByRole('button', { name: 'Reply', exact: true }) });
    const submit = replyForm.getByRole('button', { name: 'Reply', exact: true });

    const [req] = await Promise.all([
      page.waitForRequest(
        (r) => /\/api\/prompts\/1\/comments$/.test(r.url()) && r.method() === 'POST',
      ),
      submit.click(),
    ]);

    const body = req.postDataJSON() as { content: string; parentId: number };
    expect(body.parentId).toBe(11);
    expect(body.content).toContain('a reply');
  });
});
