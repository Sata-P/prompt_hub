import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mockPromptApi, type MockPrompt } from './helpers/mocks';

// Detail-page tests hit the dev server concurrently and parallel workers
// can race the Turbopack first-compile of /prompts/[id], occasionally
// pushing individual tests past their 30s timeout. Run this file serially.
test.describe.configure({ mode: 'serial' });

const VIEWER_ID = 1;
const OTHER_USER_ID = 99;

function basePrompt(overrides: Partial<MockPrompt> = {}): MockPrompt {
  return {
    id: 1,
    title: 'My Test Prompt',
    description: 'A prompt used for archive tests.',
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

/**
 * Override `GET/PATCH /api/prompts/:id` with a richer response that includes
 * `owner` + version `status` (required by the detail page) and mirrors the
 * archive toggle semantics on PATCH.
 *
 * Must be called AFTER `mockPromptApi` so this handler is invoked first.
 */
async function mockPromptDetail(
  page: Page,
  prompt: MockPrompt,
  ownerId: number,
) {
  await page.route(`**/api/prompts/${prompt.id}`, async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      return route.fulfill({
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
      });
    }

    if (method === 'PATCH') {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      let nextStatus = prompt.status;
      if (body.archived === true) nextStatus = 'ARCHIVED';
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...prompt, status: nextStatus }),
      });
    }

    return route.fallback();
  });

  // CommentSection fetches comments on mount — return an empty list so the
  // detail page renders without network errors.
  await page.route(`**/api/prompts/${prompt.id}/comments`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    }),
  );
}

test.describe('Prompt archive — owner', () => {
  test('archive on PUBLISHED prompt warns about visibility and sends { archived: true }', async ({ page }) => {
    await mockPromptApi(page);
    await mockPromptDetail(page, basePrompt({ status: 'PUBLISHED' }), VIEWER_ID);

    await page.goto('/prompts/1');

    const archiveBtn = page.getByRole('button', { name: 'Archive', exact: true });
    await expect(archiveBtn).toBeVisible();
    await archiveBtn.click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/currently published/i);

    const [request] = await Promise.all([
      page.waitForRequest(
        (req) => /\/api\/prompts\/1$/.test(req.url()) && req.method() === 'PATCH',
      ),
      dialog.getByRole('button', { name: 'Archive', exact: true }).click(),
    ]);

    expect(request.postDataJSON()).toEqual({ archived: true });
  });

  test('archive on DRAFT prompt shows the neutral warning (no published copy)', async ({ page }) => {
    await mockPromptApi(page);
    await mockPromptDetail(page, basePrompt({ status: 'DRAFT' }), VIEWER_ID);

    await page.goto('/prompts/1');

    await page.getByRole('button', { name: 'Archive', exact: true }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).not.toContainText(/currently published/i);
  });

  test('cancelling the confirm dialog does not send any PATCH', async ({ page }) => {
    await mockPromptApi(page);
    await mockPromptDetail(page, basePrompt({ status: 'PUBLISHED' }), VIEWER_ID);

    await page.goto('/prompts/1');

    let patchCount = 0;
    page.on('request', (req) => {
      if (req.method() === 'PATCH' && /\/api\/prompts\/1$/.test(req.url())) {
        patchCount++;
      }
    });

    await page.getByRole('button', { name: 'Archive', exact: true }).click();
    const dialog = page.getByRole('alertdialog');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();

    await page.waitForTimeout(200);
    expect(patchCount).toBe(0);
  });

  test('archive button is hidden when status is ARCHIVED — Unarchive shows instead', async ({ page }) => {
    await mockPromptApi(page);
    await mockPromptDetail(page, basePrompt({ status: 'ARCHIVED' }), VIEWER_ID);

    await page.goto('/prompts/1');

    await expect(page.getByRole('button', { name: 'Unarchive', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive', exact: true })).toHaveCount(0);
  });

  test('archive button is hidden when status is REVIEW', async ({ page }) => {
    await mockPromptApi(page);
    await mockPromptDetail(page, basePrompt({ status: 'REVIEW' }), VIEWER_ID);

    await page.goto('/prompts/1');

    // Wait for the page to render fully (status badge appears in the header)
    await expect(page.getByText('My Test Prompt', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive', exact: true })).toHaveCount(0);
  });

  test('unarchive sends { archived: false }', async ({ page }) => {
    await mockPromptApi(page);
    await mockPromptDetail(page, basePrompt({ status: 'ARCHIVED' }), VIEWER_ID);

    await page.goto('/prompts/1');

    await page.getByRole('button', { name: 'Unarchive', exact: true }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();

    const [request] = await Promise.all([
      page.waitForRequest(
        (req) => /\/api\/prompts\/1$/.test(req.url()) && req.method() === 'PATCH',
      ),
      dialog.getByRole('button', { name: 'Restore', exact: true }).click(),
    ]);

    expect(request.postDataJSON()).toEqual({ archived: false });
  });
});

test.describe('Prompt archive — non-owner', () => {
  test('archive / unarchive buttons are not rendered for non-owners', async ({ page }) => {
    await mockPromptApi(page);
    // Owner id = 99 — current viewer (id=1) is not the owner.
    await mockPromptDetail(page, basePrompt({ status: 'PUBLISHED' }), OTHER_USER_ID);

    await page.goto('/prompts/1');

    await expect(page.getByText('My Test Prompt', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Unarchive', exact: true })).toHaveCount(0);
  });
});
