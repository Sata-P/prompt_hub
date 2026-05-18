import { test, expect } from '@playwright/test';
import { mockPromptApi, samplePrompts, type MockPrompt } from './helpers/mocks';

// Uses the default VIEWER cookie injected by global-setup.

test.describe('Prompt CRUD', () => {
  test('library lists prompts returned from the API', async ({ page }) => {
    await mockPromptApi(page);
    await page.goto('/prompts');

    await expect(page.getByText('Prompt Library')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Summarize Article' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Draft Email Reply' })).toBeVisible();
  });

  test('creates a new prompt', async ({ page }) => {
    const prompts: MockPrompt[] = [...samplePrompts];
    await mockPromptApi(page, { prompts });

    await page.goto('/prompts/new');

    await page.getByLabel('Prompt Title').fill('Translate to Thai');
    await page.getByLabel('Description (Optional)').fill('Translate any English text to Thai.');
    await page
      .getByPlaceholder(/Type your prompt template here/)
      .fill('Translate the following to Thai: {{text}}');

    const [request] = await Promise.all([
      page.waitForRequest((req) =>
        req.url().endsWith('/api/prompts') && req.method() === 'POST',
      ),
      page.getByRole('button', { name: 'Save Prompt' }).click(),
    ]);

    const body = request.postDataJSON();
    expect(body.title).toBe('Translate to Thai');
    expect(body.templateContent).toContain('{{text}}');

    await page.waitForURL(/\/prompts\/\d+$/);
  });

  test('does not submit when required fields are empty', async ({ page }) => {
    await mockPromptApi(page);

    let postCount = 0;
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().endsWith('/api/prompts')) postCount++;
    });

    await page.goto('/prompts/new');
    await page.getByRole('button', { name: 'Save Prompt' }).click();

    await page.waitForTimeout(300);
    await expect(page).toHaveURL(/\/prompts\/new$/);
    expect(postCount).toBe(0);
  });

  test('edits an existing prompt', async ({ page }) => {
    const prompts: MockPrompt[] = [...samplePrompts];
    await mockPromptApi(page, { prompts });

    await page.goto('/prompts/2/edit');

    const titleField = page.getByLabel('Prompt Title');
    await expect(titleField).toHaveValue('Draft Email Reply');

    await titleField.fill('Draft Email Reply (v2)');

    const [request] = await Promise.all([
      page.waitForRequest((req) =>
        /\/api\/prompts\/2$/.test(req.url()) &&
        (req.method() === 'PATCH' || req.method() === 'PUT'),
      ),
      page.getByRole('button', { name: 'Save Changes' }).click(),
    ]);

    expect(request.postDataJSON().title).toBe('Draft Email Reply (v2)');
  });
});
