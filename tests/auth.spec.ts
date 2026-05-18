import { test, expect } from '@playwright/test';
import { mockCredentialsSignIn, mockSession } from './helpers/mocks';

// The whole auth file runs *signed out*; otherwise the AppShell would
// already redirect us off /login.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication', () => {
  test('renders the sign-in form', async ({ page }) => {
    await mockSession(page, null);
    await page.goto('/login');

    // CardTitle is rendered as a div (data-slot="card-title"), not a heading.
    await expect(page.locator('[data-slot="card-title"]')).toHaveText('Sign In');
    await expect(page.getByText('Sign in to your Prompt Hub account')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeEnabled();
  });

  test('stays on /login when credentials are invalid', async ({ page }) => {
    await mockSession(page, null);
    await mockCredentialsSignIn(page, { success: false, error: 'Invalid email or password' });

    await page.goto('/login');
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for the in-flight indicator to settle, then assert we did not navigate.
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows a loading state while the request is in flight', async ({ page }) => {
    await mockSession(page, null);
    await page.route('**/api/auth/callback/credentials**', async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'http://localhost:3000/dashboard' }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('viewer@test.local');
    await page.getByLabel('Password').fill('whatever');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
  });
});
