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
const MOCK_COLLECTIONS = [
  { id: 1, name: 'Marketing Prompts', description: 'Prompts for marketing team', visibility: 'PUBLIC', _count: { prompts: 5 } },
  { id: 2, name: 'Dev Toolkit', description: 'Developer utility prompts', visibility: 'PRIVATE', _count: { prompts: 3 } },
  { id: 3, name: 'Empty Collection', description: 'Nothing here yet', visibility: 'PRIVATE', _count: { prompts: 0 } },
];

// =============================================================
// TEST SUITE: Collections Page
// =============================================================
test.describe('Collections Page', () => {

  // ───────────────────────────────────────────────────────
  // TC-1: Page header and "Create" button render
  // WHY: Smoke test — admin users should see the page
  //      title and have access to the Create button.
  // ───────────────────────────────────────────────────────
  test('TC-1: Should render page header and Create button for admin', async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/collections');

    await expect(page.getByRole('heading', { name: 'Collections' })).toBeVisible();
    await expect(page.getByText('Group prompts into themed sets')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Collection/i })).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-2: Collections list renders cards with data
  // WHY: Each collection card must show name, description,
  //      prompt count, and Public badge (if applicable).
  // ───────────────────────────────────────────────────────
  test('TC-2: Should display collection cards', async ({ page }) => {
    await page.route('**/api/collections', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify(MOCK_COLLECTIONS),
        });
      } else {
        await route.continue();
      }
    });

    await login(page);
    await page.goto('http://localhost:3000/collections');

    // Verify collection names
    await expect(page.getByText('Marketing Prompts')).toBeVisible();
    await expect(page.getByText('Dev Toolkit')).toBeVisible();

    // Verify descriptions
    await expect(page.getByText('Prompts for marketing team')).toBeVisible();

    // Verify prompt counts
    await expect(page.getByText('5 Prompts')).toBeVisible();
    await expect(page.getByText('3 Prompts')).toBeVisible();
    await expect(page.getByText('0 Prompts')).toBeVisible();

    // Verify Public badge on public collection
    await expect(page.getByText('Public')).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-3: Empty state shows when no collections
  // WHY: New deployments / fresh users need guidance
  //      on how to get started, not a blank page.
  // ───────────────────────────────────────────────────────
  test('TC-3: Should show empty state when no collections', async ({ page }) => {
    await page.route('**/api/collections', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else {
        await route.continue();
      }
    });

    await login(page);
    await page.goto('http://localhost:3000/collections');

    await expect(page.getByText('No Collections Yet')).toBeVisible();
    await expect(page.getByText('Create your first collection')).toBeVisible();
  });

  // ───────────────────────────────────────────────────────
  // TC-4: Create collection dialog opens and validates
  // WHY: The create flow is critical CRUD. We test that
  //      the dialog opens, fields are required, and
  //      the submit button is disabled when name is empty.
  // ───────────────────────────────────────────────────────
  test('TC-4: Should open create dialog and validate form', async ({ page }) => {
    await page.route('**/api/collections', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify(MOCK_COLLECTIONS),
        });
      } else {
        await route.continue();
      }
    });

    await login(page);
    await page.goto('http://localhost:3000/collections');

    // Open create dialog
    await page.getByRole('button', { name: /Create Collection/i }).click();

    // Verify dialog elements
    await expect(page.getByText('Create Collection')).toBeVisible();
    await expect(page.getByLabel('Collection Name')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByText('Public Visibility')).toBeVisible();

    // Create button should be disabled when name is empty
    const createBtn = page.getByRole('button', { name: 'Create' });
    await expect(createBtn).toBeDisabled();

    // Fill in name → Create should be enabled
    await page.getByLabel('Collection Name').fill('New Collection');
    await expect(createBtn).toBeEnabled();

    // Cancel closes the dialog
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  // ───────────────────────────────────────────────────────
  // TC-5: Click collection card navigates to detail
  // WHY: Users must be able to drill into a collection
  //      to see its prompts.
  // ───────────────────────────────────────────────────────
  test('TC-5: Should navigate to collection detail on card click', async ({ page }) => {
    await page.route('**/api/collections', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify(MOCK_COLLECTIONS),
        });
      } else {
        await route.continue();
      }
    });

    await login(page);
    await page.goto('http://localhost:3000/collections');

    // Click on the first collection card
    await page.getByText('Marketing Prompts').click();
    await expect(page).toHaveURL(/\/collections\/1/);
  });

  // ───────────────────────────────────────────────────────
  // TC-6: Loading skeleton is displayed during fetch
  // WHY: Consistent skeleton loading improves perceived
  //      performance and prevents layout shift.
  // ───────────────────────────────────────────────────────
  test('TC-6: Should show loading skeletons', async ({ page }) => {
    await page.route('**/api/collections', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify(MOCK_COLLECTIONS),
      });
    });

    await login(page);
    await page.goto('http://localhost:3000/collections');

    // Skeletons should appear
    const skeletons = page.locator('[data-slot="skeleton"]');
    await expect(skeletons.first()).toBeVisible();

    // After loading, real content appears
    await expect(page.getByText('Marketing Prompts')).toBeVisible({ timeout: 5000 });
  });
});
