import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('11111111');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('http://localhost:3000/dashboard');
}

const MOCK_LOGS = {
  data: [
    { id: 1, user_id: 1, action: 'CREATE_PROMPT', details: { title: 'New Prompt' }, created_at: '2026-05-11T10:00:00Z', user: { id: 1, name: 'Admin', email: 'admin@gmail.com' } },
    { id: 2, user_id: 1, action: 'UPDATE_PROMPT', details: { title: 'Updated Prompt' }, created_at: '2026-05-11T09:00:00Z', user: { id: 1, name: 'Admin', email: 'admin@gmail.com' } },
    { id: 3, user_id: 2, action: 'DELETE_PROMPT', details: { title: 'Old Prompt' }, created_at: '2026-05-11T08:00:00Z', user: { id: 2, name: 'User2', email: 'user2@gmail.com' } },
    { id: 4, user_id: 1, action: 'FAVORITE_PROMPT', details: null, created_at: '2026-05-11T07:00:00Z', user: { id: 1, name: 'Admin', email: 'admin@gmail.com' } },
  ],
  pagination: { total: 4, page: 1, limit: 20, totalPages: 1 },
};

test.describe('Activity Log Page', () => {

  // TC-1: Page header renders correctly for admin
  // WHY: Admin should see "All system-wide activity" while normal user sees "personal"
  test('TC-1: Should render page header', async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/activity_log');
    await expect(page.getByRole('heading', { name: 'Activity Log' })).toBeVisible();
  });

  // TC-2: Activity table displays log entries with action badges
  // WHY: Each log entry must show the action type with a color-coded badge,
  //      user info (admin only), details, and timestamp.
  test('TC-2: Should display activity log entries', async ({ page }) => {
    await page.route('**/api/activityLog*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LOGS) });
    });
    await login(page);
    await page.goto('http://localhost:3000/activity_log');

    // Verify table headers
    await expect(page.getByText('Action').first()).toBeVisible();
    await expect(page.getByText('Details').first()).toBeVisible();
    await expect(page.getByText('Timestamp').first()).toBeVisible();

    // Verify action badges
    await expect(page.getByText('CREATE_PROMPT')).toBeVisible();
    await expect(page.getByText('UPDATE_PROMPT')).toBeVisible();
    await expect(page.getByText('DELETE_PROMPT')).toBeVisible();
    await expect(page.getByText('FAVORITE_PROMPT')).toBeVisible();

    // Verify total count
    await expect(page.getByText('Total 4 entries')).toBeVisible();
  });

  // TC-3: Empty state when no logs
  // WHY: Fresh systems with no activity should show a message, not an empty table.
  test('TC-3: Should show empty state when no logs', async ({ page }) => {
    await page.route('**/api/activityLog*', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } }),
      });
    });
    await login(page);
    await page.goto('http://localhost:3000/activity_log');
    await expect(page.getByText('No activity recorded yet')).toBeVisible();
  });

  // TC-4: Pagination controls work
  // WHY: Activity logs can be large. Pagination must correctly
  //      show page info and disable buttons at boundaries.
  test('TC-4: Should show pagination when multiple pages', async ({ page }) => {
    const multiPageLogs = {
      ...MOCK_LOGS,
      pagination: { total: 45, page: 1, limit: 20, totalPages: 3 },
    };
    await page.route('**/api/activityLog*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(multiPageLogs) });
    });
    await login(page);
    await page.goto('http://localhost:3000/activity_log');

    // Verify pagination text
    await expect(page.getByText('Page 1 of 3')).toBeVisible();

    // Previous should be disabled on page 1
    const prevBtn = page.getByRole('button', { name: /Previous/i });
    await expect(prevBtn).toBeDisabled();

    // Next should be enabled
    const nextBtn = page.getByRole('button', { name: /Next/i });
    await expect(nextBtn).toBeEnabled();
  });

  // TC-5: Loading skeletons shown while fetching
  // WHY: Table data can take time to load; skeletons provide visual feedback.
  test('TC-5: Should show loading skeletons', async ({ page }) => {
    await page.route('**/api/activityLog*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LOGS) });
    });
    await login(page);
    await page.goto('http://localhost:3000/activity_log');

    const skeletons = page.locator('[data-slot="skeleton"]');
    await expect(skeletons.first()).toBeVisible();

    // After load, real data appears
    await expect(page.getByText('CREATE_PROMPT')).toBeVisible({ timeout: 5000 });
  });

  // TC-6: Admin sees Actor column with user info
  // WHY: Admin users should see who performed each action.
  //      This column is hidden for non-admin users.
  test('TC-6: Admin should see Actor column', async ({ page }) => {
    await page.route('**/api/activityLog*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LOGS) });
    });
    await login(page);
    await page.goto('http://localhost:3000/activity_log');

    // Admin should see Actor header
    await expect(page.getByText('Actor')).toBeVisible();

    // Verify user names appear
    await expect(page.getByText('Admin').first()).toBeVisible();
    await expect(page.getByText('User2')).toBeVisible();
  });
});
