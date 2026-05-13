import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────
// Helper: Login and navigate to dashboard
// ─────────────────────────────────────────────────────────
async function loginAndGoToDashboard(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('11111111');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('http://localhost:3000/dashboard');
}

// ─────────────────────────────────────────────────────────
// Mock: Dashboard stats API response
// ─────────────────────────────────────────────────────────
const MOCK_STATS = {
  totalPrompts: 12,
  systemTotalPrompts: 50,
  totalFavorites: 3,
  byStatus: {
    DRAFT: 2,
    REVIEW: 1,
    PUBLISHED: 8,
    REJECTED: 0,
    ARCHIVED: 1,
  },
  recentPrompts: [
    {
      id: 1,
      title: 'API Integration Prompt',
      status: 'PUBLISHED',
      latest_version_no: 3,
      updated_at: '2026-05-11T10:00:00Z',
      category: { id: 1, name: 'Development', color: '#3b82f6' },
    },
    {
      id: 2,
      title: 'Code Review Helper',
      status: 'DRAFT',
      latest_version_no: 1,
      updated_at: '2026-05-10T08:00:00Z',
      category: { id: 2, name: 'Testing', color: '#10b981' },
    },
    {
      id: 3,
      title: 'Bug Report Generator',
      status: 'REVIEW',
      latest_version_no: 2,
      updated_at: '2026-05-09T15:00:00Z',
      category: null,
    },
  ],
  totalCategories: 5,
  totalTags: 10,
  popularCategories: [
    {
      id: 1,
      name: 'Development',
      color: '#3b82f6',
      _count: { prompts: 15 },
      prompts: [
        { id: 1, title: 'API Integration Prompt', status: 'PUBLISHED' },
        { id: 4, title: 'Database Query Builder', status: 'PUBLISHED' },
      ],
    },
    {
      id: 2,
      name: 'Testing',
      color: '#10b981',
      _count: { prompts: 8 },
      prompts: [
        { id: 2, title: 'Code Review Helper', status: 'DRAFT' },
      ],
    },
  ],
  popularTags: [
    { id: 1, name: 'api', _count: { prompts: 10 }, prompts: [] },
    { id: 2, name: 'testing', _count: { prompts: 7 }, prompts: [] },
    { id: 3, name: 'automation', _count: { prompts: 5 }, prompts: [] },
  ],
};

// =============================================================
// TEST SUITE: Dashboard Page
// =============================================================
test.describe('Dashboard Page', () => {

  // ───────────────────────────────────────────────────────
  // TC-1: Stats cards show correct numbers
  // WHY: Stats cards (My Prompts, Total, Favorites) are
  //      the first thing users see. We need to verify
  //      the API data flows correctly to the UI.
  // ───────────────────────────────────────────────────────
  test('TC-1: Should display stats cards with correct values', async ({ page }) => {
    await loginAndGoToDashboard(page);

    // Intercept the stats API and provide mock data
    await page.route('**/api/dashboard/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_STATS),
      });
    });

    await page.goto('http://localhost:3000/dashboard');

    // Verify page header
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Verify stats cards show correct values
    await expect(page.getByText('My Prompts')).toBeVisible();
    await expect(page.getByText('12')).toBeVisible(); // totalPrompts

    await expect(page.getByText('Total Prompts')).toBeVisible();
    await expect(page.getByText('50')).toBeVisible(); // systemTotalPrompts

    await expect(page.getByText('Favorite Prompts')).toBeVisible();
    await expect(page.getByText('3')).toBeVisible(); // totalFavorites
  });

  // ───────────────────────────────────────────────────────
  // TC-2: Recently Updated section shows prompt list
  // WHY: This section is the main content area. We verify
  //      that prompts render with title, category badge,
  //      version number, and date.
  // ───────────────────────────────────────────────────────
  test('TC-2: Should display recently updated prompts', async ({ page }) => {
    await page.route('**/api/dashboard/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_STATS),
      });
    });

    await loginAndGoToDashboard(page);
    await page.goto('http://localhost:3000/dashboard');

    // Verify section header
    await expect(page.getByText('Recently Updated')).toBeVisible();

    // Verify prompt titles are rendered
    await expect(page.getByText('API Integration Prompt')).toBeVisible();
    await expect(page.getByText('Code Review Helper')).toBeVisible();
    await expect(page.getByText('Bug Report Generator')).toBeVisible();

    // Verify category badges are shown
    await expect(page.getByText('Development').first()).toBeVisible();
    await expect(page.getByText('Testing').first()).toBeVisible();

    // Verify version numbers are shown
    await expect(page.getByText('v3')).toBeVisible();
    await expect(page.getByText('v1').first()).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-3: "View all" link navigates to prompts page
  // WHY: Navigation is a core UX flow. Users should be
  //      able to go from dashboard to the full prompts
  //      list via the "View all" button.
  // ───────────────────────────────────────────────────────
  test('TC-3: View all link should navigate to prompts page', async ({ page }) => {
    await loginAndGoToDashboard(page);

    // Find and click "View all"
    const viewAllLink = page.getByRole('link', { name: /View all/i });
    await expect(viewAllLink).toBeVisible();
    await viewAllLink.click();

    // Verify navigation to prompts page
    await expect(page).toHaveURL(/\/prompts/);
  });

  // ───────────────────────────────────────────────────────
  // TC-4: Clicking a recent prompt navigates to its detail
  // WHY: Each prompt in the recently updated list is a
  //      link. We verify navigation works correctly by
  //      checking the URL pattern matches /prompts/{id}.
  // ───────────────────────────────────────────────────────
  test('TC-4: Clicking a recent prompt should navigate to its detail', async ({ page }) => {
    await page.route('**/api/dashboard/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_STATS),
      });
    });

    await loginAndGoToDashboard(page);
    await page.goto('http://localhost:3000/dashboard');

    // Click on the first prompt
    await page.getByText('API Integration Prompt').click();

    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/prompts\/1/);
  });

  // ───────────────────────────────────────────────────────
  // TC-5: Tags section renders tag badges with counts
  // WHY: Tags provide quick categorization context.
  //      We verify tags render from mock data and display
  //      the prompt count in parentheses.
  // ───────────────────────────────────────────────────────
  test('TC-5: Should display popular tags with prompt counts', async ({ page }) => {
    await page.route('**/api/dashboard/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_STATS),
      });
    });

    await loginAndGoToDashboard(page);
    await page.goto('http://localhost:3000/dashboard');

    // Verify tags section header
    await expect(page.getByText('Tags').first()).toBeVisible();

    // Verify tag names and counts
    await expect(page.getByText('api').first()).toBeVisible();
    await expect(page.getByText('(10)')).toBeVisible();
    await expect(page.getByText('testing').first()).toBeVisible();
    await expect(page.getByText('(7)')).toBeVisible();
    await expect(page.getByText('automation')).toBeVisible();
    await expect(page.getByText('(5)')).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-6: Categories section with click-to-expand popup
  // WHY: Categories are interactive — clicking one opens
  //      a modal showing the prompts in that category.
  //      This tests the full interaction flow.
  // ───────────────────────────────────────────────────────
  test('TC-6: Should show category popup with prompts when clicked', async ({ page }) => {
    await page.route('**/api/dashboard/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_STATS),
      });
    });

    await loginAndGoToDashboard(page);
    await page.goto('http://localhost:3000/dashboard');

    // Verify categories section header
    await expect(page.getByText('Categories').first()).toBeVisible();

    // Verify category names and prompt counts
    await expect(page.getByText('Development').first()).toBeVisible();
    await expect(page.getByText('2 prompts').first()).toBeVisible();

    // Click on a category to open the popup
    await page.getByText('Development').first().click();

    // Verify the popup appears with prompts inside
    await expect(page.getByText(/Prompts in/)).toBeVisible();
    await expect(page.getByText('API Integration Prompt').nth(1)).toBeVisible();
    await expect(page.getByText('Database Query Builder')).toBeVisible();

    // Close the popup
    await page.locator('button').filter({ has: page.locator('svg') }).last().click();
  });

  // ───────────────────────────────────────────────────────
  // TC-7: Loading skeleton is shown while data fetches
  // WHY: Good UX requires visual feedback during loading.
  //      We verify that skeleton loaders appear before data
  //      is ready, preventing layout shift.
  // ───────────────────────────────────────────────────────
  test('TC-7: Should show loading skeletons while fetching data', async ({ page }) => {
    // Delay the API response to observe loading state
    await page.route('**/api/dashboard/stats', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_STATS),
      });
    });

    await loginAndGoToDashboard(page);
    await page.goto('http://localhost:3000/dashboard');

    // Skeleton loaders should be visible during loading
    // (Skeleton elements use data-slot="skeleton")
    const skeletons = page.locator('[data-slot="skeleton"]');
    await expect(skeletons.first()).toBeVisible();

    // After data loads, skeletons should disappear and real content appears
    await expect(page.getByText('Recently Updated')).toBeVisible();
    await expect(page.getByText('API Integration Prompt')).toBeVisible({ timeout: 5000 });
  });

  // ───────────────────────────────────────────────────────
  // TC-8: Empty state when no prompts exist
  // WHY: New users or users with no prompts should see
  //      a helpful empty state with a CTA to create
  //      their first prompt, not a broken/blank page.
  // ───────────────────────────────────────────────────────
  test('TC-8: Should show empty state when no prompts exist', async ({ page }) => {
    const emptyStats = {
      ...MOCK_STATS,
      totalPrompts: 0,
      systemTotalPrompts: 0,
      totalFavorites: 0,
      recentPrompts: [],
      popularCategories: [],
      popularTags: [],
    };

    await page.route('**/api/dashboard/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyStats),
      });
    });

    await loginAndGoToDashboard(page);
    await page.goto('http://localhost:3000/dashboard');

    // Verify empty state message
    await expect(page.getByText('No prompts yet')).toBeVisible();

    // Verify CTA button exists
    await expect(page.getByText('Create your first prompt')).toBeVisible();

    // Verify empty tags/categories messages
    await expect(page.getByText('No tags found')).toBeVisible();
    await expect(page.getByText('No categories found')).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-9: API error is handled gracefully
  // WHY: When the server returns an error, the page
  //      should not crash. It should show 0 values or
  //      empty states gracefully.
  // ───────────────────────────────────────────────────────
  test('TC-9: Should handle API error gracefully', async ({ page }) => {
    await page.route('**/api/dashboard/stats', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await loginAndGoToDashboard(page);
    await page.goto('http://localhost:3000/dashboard');

    // Page should still render (no crash) — stats show 0
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-10: Sidebar navigation works from dashboard
  // WHY: The sidebar is the primary navigation. We verify
  //      that clicking sidebar links from the dashboard
  //      correctly navigates to target pages.
  // ───────────────────────────────────────────────────────
  test('TC-10: Should navigate to other pages via sidebar', async ({ page }) => {
    await loginAndGoToDashboard(page);

    // Navigate to Prompts
    await page.getByRole('link', { name: 'Prompts' }).click();
    await expect(page).toHaveURL(/\/prompts/);

    // Navigate back to Dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Playground
    await page.getByRole('link', { name: 'Playground' }).click();
    await expect(page).toHaveURL(/\/playground/);
  });

});
