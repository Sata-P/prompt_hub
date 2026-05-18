import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import { mockPromptApi, mockUserApi } from './helpers/mocks';

const STATUS_TRIGGER = 'button[role="combobox"]:has-text("All Status")';

test.describe('Admin & role gating', () => {
  test.describe('as VIEWER', () => {
    test('status filter shows DRAFT + REJECTED but NOT REVIEW', async ({ page }) => {
      await mockPromptApi(page);
      await page.goto('/prompts');

      await page.locator(STATUS_TRIGGER).click();

      await expect(page.getByRole('option', { name: 'DRAFT' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'REJECTED' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'REVIEW' })).toHaveCount(0);
    });
  });

  test.describe('as ADMIN', () => {
    test.use({
      storageState: path.resolve(__dirname, '.auth/admin.json'),
    });

    test('status filter shows REVIEW but NOT DRAFT/REJECTED', async ({ page }) => {
      await mockPromptApi(page);
      await page.goto('/prompts');

      await page.locator(STATUS_TRIGGER).click();

      await expect(page.getByRole('option', { name: 'REVIEW' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'DRAFT' })).toHaveCount(0);
      await expect(page.getByRole('option', { name: 'REJECTED' })).toHaveCount(0);
    });

    test('can load the users API', async ({ page }) => {
      await mockUserApi(page);

      const res = await page.request.get('/api/users');
      expect(res.ok()).toBeTruthy();
      const users = await res.json();
      expect(users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ role: 'ADMIN' }),
          expect.objectContaining({ role: 'EDITOR' }),
        ]),
      );
    });
  });
});
