import { test, expect } from '@playwright/test';
import * as path from 'node:path';
import { mockPromptApi } from './helpers/mocks';

// Parallel dev-compilation of /dashboard + /prompts can race past the default
// 30s timeout for individual cases. Run this file serially.
test.describe.configure({ mode: 'serial' });

test.describe('Dashboard stat cards', () => {
  test.describe('as VIEWER', () => {
    test('shows Total / Published / In Draft / Archived (no In Review)', async ({ page }) => {
      await mockPromptApi(page);
      await page.goto('/dashboard');

      await expect(page.getByRole('link', { name: 'Total Prompts', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Published', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'In Draft', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Archived', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'In Review', exact: true })).toHaveCount(0);
    });

    test('clicking Published navigates to /prompts?status=published and pre-selects the filter', async ({ page }) => {
      await mockPromptApi(page);
      await page.goto('/dashboard');

      await page.getByRole('link', { name: 'Published', exact: true }).click();

      await page.waitForURL(/\/prompts\?status=published$/);
      // Status select shows "APPROVED" label for the `published` value.
      await expect(
        page.locator('button[role="combobox"]:has-text("APPROVED")'),
      ).toBeVisible();
    });

    test('clicking In Draft navigates to /prompts?status=draft', async ({ page }) => {
      await mockPromptApi(page);
      await page.goto('/dashboard');

      await page.getByRole('link', { name: 'In Draft', exact: true }).click();

      await page.waitForURL(/\/prompts\?status=draft$/);
      await expect(
        page.locator('button[role="combobox"]:has-text("DRAFT")'),
      ).toBeVisible();
    });

    test('clicking Archived navigates to /prompts?status=archived', async ({ page }) => {
      await mockPromptApi(page);
      await page.goto('/dashboard');

      await page.getByRole('link', { name: 'Archived', exact: true }).click();

      await page.waitForURL(/\/prompts\?status=archived$/);
      await expect(
        page.locator('button[role="combobox"]:has-text("ARCHIVED")'),
      ).toBeVisible();
    });

    test('clicking Total Prompts navigates to /prompts without a status filter', async ({ page }) => {
      await mockPromptApi(page);
      await page.goto('/dashboard');

      await page.getByRole('link', { name: 'Total Prompts', exact: true }).click();

      await page.waitForURL(/\/prompts$/);
      await expect(
        page.locator('button[role="combobox"]:has-text("All Status")'),
      ).toBeVisible();
    });
  });

  test.describe('as ADMIN', () => {
    test.use({
      storageState: path.resolve(__dirname, '.auth/admin.json'),
    });

    test('replaces In Draft with In Review (system) card', async ({ page }) => {
      await mockPromptApi(page);
      await page.goto('/dashboard');

      await expect(page.getByRole('link', { name: 'Total Prompts', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Published', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'In Review', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Archived', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'In Draft', exact: true })).toHaveCount(0);
    });

    test('clicking In Review navigates to /prompts?status=review and pre-selects the filter', async ({ page }) => {
      await mockPromptApi(page);
      await page.goto('/dashboard');

      await page.getByRole('link', { name: 'In Review', exact: true }).click();

      await page.waitForURL(/\/prompts\?status=review$/);
      await expect(
        page.locator('button[role="combobox"]:has-text("REVIEW")'),
      ).toBeVisible();
    });
  });
});
