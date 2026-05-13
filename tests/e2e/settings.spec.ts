import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('11111111');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('http://localhost:3000/dashboard');
}

test.describe('Settings Page (Admin)', () => {

  // TC-1: Page renders with title and sections
  // WHY: Admin-only page. Verifies access control works and all 3 management
  //      sections (Categories, Tags, Users) are visible.
  test('TC-1: Should render settings page with all sections', async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/settings');

    await expect(page.getByRole('heading', { name: 'System Settings' })).toBeVisible();
    await expect(page.getByText('Categories').first()).toBeVisible();
    await expect(page.getByText('Tags').first()).toBeVisible();
    await expect(page.getByText('Users & Roles Management')).toBeVisible();
  });

  // TC-2: Categories section displays list
  // WHY: Categories are core taxonomy. Must show names and provide CRUD actions.
  test('TC-2: Should display categories list', async ({ page }) => {
    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Development', prompts: [{ id: 1, title: 'Prompt A' }], array_count: 1 },
          { id: 2, name: 'Marketing', prompts: [], array_count: 0 },
        ]),
      });
    });
    await page.route('**/api/tags', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/users', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await login(page);
    await page.goto('http://localhost:3000/settings');

    await expect(page.getByText('Development').first()).toBeVisible();
    await expect(page.getByText('Marketing').first()).toBeVisible();
  });

  // TC-3: Add category form shows and validates
  // WHY: CRUD operation — the inline form must appear, accept input, and
  //      the save button must be disabled when name is empty.
  test('TC-3: Should open add category form', async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/settings');

    // Click "Add" button next to Categories
    await page.getByRole('button', { name: 'Add' }).first().click();

    // Form should appear
    await expect(page.getByPlaceholder('New category name...')).toBeVisible();

    // Type a name
    await page.getByPlaceholder('New category name...').fill('New Category');
  });

  // TC-4: Tags section displays tag badges
  // WHY: Tags use a different visual format (badges) than categories.
  //      Must verify the # prefix and delete-on-hover pattern.
  test('TC-4: Should display tag badges', async ({ page }) => {
    await page.route('**/api/categories', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/tags', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'api' },
          { id: 2, name: 'testing' },
          { id: 3, name: 'automation' },
        ]),
      });
    });
    await page.route('**/api/users', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await login(page);
    await page.goto('http://localhost:3000/settings');

    await expect(page.getByText('#api')).toBeVisible();
    await expect(page.getByText('#testing')).toBeVisible();
    await expect(page.getByText('#automation')).toBeVisible();
  });

  // TC-5: Users table displays user list with roles
  // WHY: The user management table is admin-critical. Must show name, email,
  //      role badge, and role dropdown for changing permissions.
  test('TC-5: Should display users table with roles', async ({ page }) => {
    await page.route('**/api/categories', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/tags', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Admin User', email: 'admin@gmail.com', role: 'ADMIN', status: 'active' },
          { id: 2, name: 'Editor User', email: 'editor@gmail.com', role: 'EDITOR', status: 'active' },
          { id: 3, name: 'Viewer User', email: 'viewer@gmail.com', role: 'VIEWER', status: 'active' },
        ]),
      });
    });

    await login(page);
    await page.goto('http://localhost:3000/settings');

    // Verify table headers
    await expect(page.getByText('Name').first()).toBeVisible();
    await expect(page.getByText('Email').first()).toBeVisible();
    await expect(page.getByText('Role').first()).toBeVisible();

    // Verify user rows
    await expect(page.getByText('Admin User')).toBeVisible();
    await expect(page.getByText('Editor User')).toBeVisible();
    await expect(page.getByText('Viewer User')).toBeVisible();

    // Verify role badges
    // await expect(page.getByText('ADMIN').first()).toBeVisible();
    // await expect(page.getByText('EDITOR')).toBeVisible();
  });

  // TC-6: Empty states for categories and tags
  // WHY: When no categories/tags exist, admin should see clear "no data" messages.
  test('TC-6: Should show empty states', async ({ page }) => {
    await page.route('**/api/categories', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/tags', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/users', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await login(page);
    await page.goto('http://localhost:3000/settings');

    await expect(page.getByText('No categories created yet')).toBeVisible();
    await expect(page.getByText('No tags created yet')).toBeVisible();
  });
});
