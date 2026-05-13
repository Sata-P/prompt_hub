import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('11111111');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('http://localhost:3000/dashboard');
}

const MOCK_FAVORITES: any[] = [
  {
    id: 1, prompt_id: 10,
    prompt: {
      id: 10, title: 'Code Review Prompt', description: 'Helps review code', status: 'PUBLISHED',
      recommended_model: 'gpt-4', latest_version_no: 2, updated_at: '2026-05-10T10:00:00Z',
      category: { id: 1, name: 'Development' },
      tags: [{ id: 1, name: 'code' }, { id: 2, name: 'review' }],
      versions: [{ id: 1, promptVariables: [{ id: 1 }, { id: 2 }] }],
    },
  },
  {
    id: 2, prompt_id: 20,
    prompt: {
      id: 20, title: 'Marketing Copy Writer', description: 'Write compelling copy', status: 'PUBLISHED',
      recommended_model: null, latest_version_no: 1, updated_at: '2026-05-09T08:00:00Z',
      category: { id: 2, name: 'Marketing' }, tags: [{ id: 3, name: 'writing' }], versions: [],
    },
  },
];

test.describe('Favorites Page', () => {
  test('TC-1: Should render page header', async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/favorites');
    await expect(page.getByRole('heading', { name: 'Favorites' })).toBeVisible();
  });

  test('TC-2: Should display favorite prompt cards', async ({ page }) => {
    await page.route('**/api/favorites', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_FAVORITES) });
    });
    await login(page);
    await page.goto('http://localhost:3000/favorites');
    await expect(page.getByText('Code Review Prompt')).toBeVisible();
    await expect(page.getByText('Marketing Copy Writer')).toBeVisible();
  });

  test('TC-3: Should show empty state', async ({ page }) => {
    await page.route('**/api/favorites', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await login(page);
    await page.goto('http://localhost:3000/favorites');
    await expect(page.getByText('No favorites yet')).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Prompts/i })).toBeVisible();
  });

  test('TC-4: Should filter favorites by search', async ({ page }) => {
    await page.route('**/api/favorites', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_FAVORITES) });
    });
    await login(page);
    await page.goto('http://localhost:3000/favorites');
    await page.getByPlaceholder('Search favorites...').fill('Code Review');
    await expect(page.getByText('Code Review Prompt')).toBeVisible();
    await expect(page.getByText('Marketing Copy Writer')).not.toBeVisible();
  });

  test('TC-5: Should show no-results and clear search', async ({ page }) => {
    await page.route('**/api/favorites', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_FAVORITES) });
    });
    await login(page);
    await page.goto('http://localhost:3000/favorites');
    await page.getByPlaceholder('Search favorites...').fill('xyznonexistent');
    await expect(page.getByText(/No results for/)).toBeVisible();
    await page.getByText('Clear search').click();
    await expect(page.getByText('Code Review Prompt')).toBeVisible();
  });

  test('TC-6: Should navigate to prompt detail on card click', async ({ page }) => {
    await page.route('**/api/favorites', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_FAVORITES) });
    });
    await login(page);
    await page.goto('http://localhost:3000/favorites');
    await page.getByText('Code Review Prompt').click();
    await expect(page).toHaveURL(/\/prompts\/10/);
  });
});
