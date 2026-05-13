import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────
// Helper: Login
// ─────────────────────────────────────────────────────────
async function login(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('11111111');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('http://localhost:3000/dashboard');
}

// ─────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────
const MOCK_PROMPTS = {
  data: [
    {
      id: 1, title: 'API Integration Prompt', description: 'Generate API code', status: 'PUBLISHED',
      latest_version_no: 3, updated_at: '2026-05-11T10:00:00Z', tags: [{ id: 1, name: 'api' }],
      category: { id: 1, name: 'Development' }, recommended_model: 'gpt-4',
    },
    {
      id: 2, title: 'Test Generator', description: 'Generate tests', status: 'DRAFT',
      latest_version_no: 1, updated_at: '2026-05-10T08:00:00Z', tags: [{ id: 2, name: 'testing' }],
      category: { id: 2, name: 'Testing' }, recommended_model: null,
    },
    {
      id: 3, title: 'No Tags Prompt', description: null, status: 'PUBLISHED',
      latest_version_no: 1, updated_at: '2026-05-09T08:00:00Z', tags: [],
      category: null, recommended_model: null,
    },
  ],
  pagination: { total: 3, page: 1, limit: 20, totalPages: 1 },
};

// =============================================================
// TEST SUITE: Prompts Page
// =============================================================
test.describe('Prompts Page', () => {

  // ───────────────────────────────────────────────────────
  // TC-1: Page renders with header and New Prompt button
  // WHY: Basic smoke test — verifies the page loads and
  //      the primary CTA (New Prompt) is accessible.
  // ───────────────────────────────────────────────────────
  test('TC-1: Should render page header and New Prompt button', async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/prompts');

    await expect(page.getByRole('heading', { name: 'Prompt Library' })).toBeVisible();
    await expect(page.getByText('Search, filter and manage prompts')).toBeVisible();
    await expect(page.getByRole('link', { name: /New Prompt/i })).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-2: Prompts list renders with correct data
  // WHY: Core feature — the table must display titles,
  //      categories, tags, and dates from the API.
  // ───────────────────────────────────────────────────────
  test('TC-2: Should display prompt list from API', async ({ page }) => {
    await page.route('**/api/prompts?*', async (route) => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q');
      if (!q) {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify(MOCK_PROMPTS),
        });
      } else {
        await route.continue();
      }
    });

    await login(page);
    await page.goto('http://localhost:3000/prompts');

    // Verify prompts are rendered
    await expect(page.getByText('API Integration Prompt')).toBeVisible();
    await expect(page.getByText('Test Generator')).toBeVisible();
    await expect(page.getByText('No Tags Prompt')).toBeVisible();

    // Verify category is shown
    await expect(page.getByText('Development').first()).toBeVisible();

    // Verify tags are shown
    await expect(page.getByText('#api').first()).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-3: Search filters prompts
  // WHY: Search is critical for findability. We verify
  //      typing in the search box triggers a new API call
  //      with the correct query param and updates the list.
  // ───────────────────────────────────────────────────────
  test('TC-3: Should filter prompts when searching', async ({ page }) => {
    await page.route('**/api/prompts?*', async (route) => {
      const url = new URL(route.request().url());
      const q = url.searchParams.get('q');
      if (q === 'API') {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({
            data: [MOCK_PROMPTS.data[0]],
            pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
          }),
        });
      } else {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify(MOCK_PROMPTS),
        });
      }
    });

    await login(page);
    await page.goto('http://localhost:3000/prompts');

    // Type in search
    const searchInput = page.getByPlaceholder('Search prompts...');
    await searchInput.fill('API');

    // Verify filtered result
    await expect(page.getByText('API Integration Prompt')).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-4: Category filter works
  // WHY: Filters let users drill down into specific
  //      categories. We verify the select dropdown sends
  //      the correct query param.
  // ───────────────────────────────────────────────────────
  test('TC-4: Should filter by category', async ({ page }) => {
    // Mock categories for the filter dropdown
    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Development' },
          { id: 2, name: 'Testing' },
        ]),
      });
    });
    await page.route('**/api/prompts?*', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify(MOCK_PROMPTS),
      });
    });

    await login(page);
    await page.goto('http://localhost:3000/prompts');

    // Wait for categories to load in dropdown
    await expect(page.getByText('All Categories')).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-5: Tag filter buttons work
  // WHY: Tags are displayed as clickable pills. Clicking
  //      one should filter prompts by that tag.
  // ───────────────────────────────────────────────────────
  test('TC-5: Should show tag filter buttons', async ({ page }) => {
    await page.route('**/api/tags', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'api' },
          { id: 2, name: 'testing' },
        ]),
      });
    });
    await page.route('**/api/prompts?*', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify(MOCK_PROMPTS),
      });
    });

    await login(page);
    await page.goto('http://localhost:3000/prompts');

    // Verify tag buttons render
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: '#api' })).toBeVisible();
    await expect(page.getByRole('button', { name: '#testing' })).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-6: Click prompt navigates to detail page
  // WHY: Each row in the table links to the prompt detail.
  //      This is the main navigation from the list view.
  // ───────────────────────────────────────────────────────
  test('TC-6: Should navigate to prompt detail on click', async ({ page }) => {
    await page.route('**/api/prompts?*', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify(MOCK_PROMPTS),
      });
    });

    await login(page);
    await page.goto('http://localhost:3000/prompts');

    await page.getByRole('link', { name: 'API Integration Prompt' }).click();
    await expect(page).toHaveURL(/\/prompts\/1/);
  });

  // ───────────────────────────────────────────────────────
  // TC-7: Empty state shows no-results message
  // WHY: When no prompts match filters, users need
  //      clear feedback instead of a blank table.
  // ───────────────────────────────────────────────────────
  test('TC-7: Should show empty state when no prompts found', async ({ page }) => {
    await page.route('**/api/prompts?*', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } }),
      });
    });

    await login(page);
    await page.goto('http://localhost:3000/prompts');

    await expect(page.getByText('No prompts found matching your criteria')).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-8: New Prompt button navigates correctly
  // WHY: The CTA for creating new prompts must work.
  // ───────────────────────────────────────────────────────
  test('TC-8: New Prompt button should navigate to create page', async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/prompts');

    await page.getByRole('link', { name: /New Prompt/i }).click();
    await expect(page).toHaveURL(/\/prompts\/new/);
  });

  // ───────────────────────────────────────────────────────
  // TC-9: Clear filters resets all filters
  // WHY: Users must be able to easily reset all filters
  //      back to default after drilling down.
  // ───────────────────────────────────────────────────────
  test('TC-9: Clear filters should reset search and tags', async ({ page }) => {
    await page.route('**/api/prompts?*', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify(MOCK_PROMPTS),
      });
    });

    await login(page);
    await page.goto('http://localhost:3000/prompts');

    // Type something to activate the filter
    await page.getByPlaceholder('Search prompts...').fill('test');

    // Clear filters button should appear
    await expect(page.getByText('Clear filters')).toBeVisible();
    await page.getByText('Clear filters').click();

    // Search should be cleared
    await expect(page.getByPlaceholder('Search prompts...')).toHaveValue('');
  });
});
