import { test, expect } from '@playwright/test';

// test('has title', async ({ page }) => {
//   await page.goto('http://localhost:3000');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Prompt Hub/);
// });

test('login test', async ({ page }) => {
 
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'อีเมล' }).click();
  await page.getByRole('textbox', { name: 'อีเมล' }).fill('admin@gmail.com');
  await page.locator('div').filter({ hasText: /^รหัสผ่าน$/ }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).click();
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('11111111');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  
});
