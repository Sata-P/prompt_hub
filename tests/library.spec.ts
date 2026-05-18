import { test, expect } from '@playwright/test';
import { mockPromptApi, type MockPrompt } from './helpers/mocks';

function makePrompt(i: number): MockPrompt {
  return {
    id: i,
    title: `Prompt ${i}`,
    description: `Description for prompt ${i}`,
    status: 'PUBLISHED',
    latest_version_no: 1,
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: '2026-05-01T00:00:00.000Z',
    category: { id: 1, name: 'Writing' },
    tags: [],
    recommended_models: null,
    visibility: 'PUBLIC',
  };
}

test.describe('Prompt library — browse & search', () => {
  test('debounces search input (one request per burst of keystrokes)', async ({ page }) => {
    await mockPromptApi(page);

    const requestsAfterTyping: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/api/prompts?') && url.includes('q=')) {
        requestsAfterTyping.push(url);
      }
    });

    await page.goto('/prompts');
    // Wait for the initial load to settle so any "background" request doesn't leak in.
    await expect(page.getByText('Prompt Library')).toBeVisible();

    const searchBox = page.getByPlaceholder('Search prompts...');
    await searchBox.pressSequentially('summarize', { delay: 30 });

    // Wait past the 300ms debounce window plus slack.
    await page.waitForTimeout(700);

    expect(requestsAfterTyping.length).toBe(1);
    expect(requestsAfterTyping[0]).toContain('q=summarize');
  });

  test('paginates when more than one page of prompts exists', async ({ page }) => {
    const many = Array.from({ length: 45 }, (_, i) => makePrompt(i + 1));
    await mockPromptApi(page, { prompts: many });

    await page.goto('/prompts');

    await expect(page.getByText(/Page 1 of 3/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Prompt 1', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(page.getByText(/Page 2 of 3/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Prompt 21', exact: true })).toBeVisible();
  });

  test('renders the empty state when no prompts match', async ({ page }) => {
    await mockPromptApi(page, { prompts: [] });

    await page.goto('/prompts');

    // Empty state appears in both the desktop table and the mobile card grid.
    await expect(page.getByText(/no prompts found/i).first()).toBeVisible();
  });

  test('clear-filters button resets the search query', async ({ page }) => {
    await mockPromptApi(page);
    await page.goto('/prompts');

    await page.getByPlaceholder('Search prompts...').fill('email');
    await expect(page.getByRole('button', { name: /clear filters/i })).toBeVisible();

    await page.getByRole('button', { name: /clear filters/i }).click();

    await expect(page.getByPlaceholder('Search prompts...')).toHaveValue('');
  });
});
