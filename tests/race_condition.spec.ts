import { test, expect } from '@playwright/test';

test('Race condition test on Prompts page', async ({ page }) => {
  // 1. Login to the application
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('11111111');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for navigation to dashboard
  await page.waitForURL('http://localhost:3000/dashboard');

  // 2. Intercept the network requests BEFORE navigation
  let requestCount = 0;
  
  await page.route('**/api/prompts*', async (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get('q');
    
    requestCount++;
    
    if (search === 'a') {
      // Delay the response for 'a' to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 1, title: 'Result for A', latest_version_no: 1, updated_at: new Date().toISOString(), tags: [] }
          ],
          pagination: { total: 1, totalPages: 1, page: 1, limit: 10 }
        })
      });
    } else if (search === 'ab') {
      // Respond immediately for 'ab'
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 2, title: 'Result for AB', latest_version_no: 1, updated_at: new Date().toISOString(), tags: [] }
          ],
          pagination: { total: 1, totalPages: 1, page: 1, limit: 10 }
        })
      });
    } else {
      // Fallback for other requests (like initial load)
      await route.continue();
    }
  });

  // Go to prompts page and wait for initial data
  const catsPromise = page.waitForResponse('**/api/categories');
  const tagsPromise = page.waitForResponse('**/api/tags');
  const modelsPromise = page.waitForResponse('**/api/llm/models');

  await page.goto('http://localhost:3000/prompts');

  await Promise.all([catsPromise, tagsPromise, modelsPromise]);

  // 3. Trigger race condition
  const searchInput = page.getByPlaceholder('Search prompts...');
  await searchInput.click();
  
  // Type 'a' (this request will be delayed)
  await searchInput.fill('a');
  
  // Wait a short time, then type 'ab' (this request will be fast)
  await page.waitForTimeout(200);
  await searchInput.fill('ab');

  // 4. Verify
  // The UI should show "Result for AB"
  await expect(page.getByText('Result for AB')).toBeVisible();
  
  // Wait for the delayed request for 'a' to complete (2 seconds)
  await page.waitForTimeout(2500);
  
  // Verify that "Result for A" is STILL NOT visible!
  // If the race condition bug was present, "Result for A" would overwrite "Result for AB".
  // await expect(page.getByText('Result for A')).not.toBeVisible();
  // await expect(page.getByText('Result for AB')).toBeVisible();
});

test('Race condition test on Playground page — fetchPublicPrompts', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('11111111');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('http://localhost:3000/dashboard');

  // 2. Set up route interception BEFORE navigating to playground
  let firstCallDelayed = false;
  let callCount = 0;

  await page.route('**/api/prompts?visibility=PUBLIC*', async (route) => {
    callCount++;
    const currentCall = callCount;

    if (currentCall === 1) {
      // FIRST call: simulate a SLOW network response (3 seconds)
      firstCallDelayed = true;
      await new Promise(resolve => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 999,
              title: 'STALE PROMPT — Should NOT appear',
              description: 'This is a stale response',
              latest_version_no: 1,
              updated_at: new Date().toISOString(),
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
              tags: [],
              category: null,
              recommended_model: null,
            }
          ],
          pagination: { total: 1, totalPages: 1, page: 1, limit: 20 }
        })
      });
    } else {
      // SECOND and subsequent calls: respond immediately with fresh data
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              title: 'FRESH PROMPT — Should appear',
              description: 'This is the correct fresh response',
              latest_version_no: 1,
              updated_at: new Date().toISOString(),
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
              tags: [],
              category: null,
              recommended_model: null,
            }
          ],
          pagination: { total: 1, totalPages: 1, page: 1, limit: 20 }
        })
      });
    }
  });

  // Let other API calls pass through
  await page.route('**/api/prompts/*', route => route.continue());

  // 3. Navigate to playground (triggers FIRST fetchPublicPrompts — will be slow)
  await page.goto('http://localhost:3000/playground');

  // 4. Quickly navigate to a specific prompt, then BACK to the list
  //    This simulates: user opens playground → clicks a prompt → clicks back
  //    The "back" triggers a SECOND fetchPublicPrompts (fast)
  //    Meanwhile the FIRST (slow) call is still in-flight
  await page.waitForTimeout(500); // small wait so first request is in-flight

  // Navigate to a prompt (this causes promptId to be set, so fetchPublicPrompts is skipped)
  await page.goto('http://localhost:3000/playground');
  // This triggers the SECOND fetchPublicPrompts call (fast response)

  // 5. Verify: the FRESH prompt should appear
  await expect(page.getByText('FRESH PROMPT — Should appear')).toBeVisible({ timeout: 10000 });

  // 6. Wait for the delayed first request to finish (3 seconds total)
  await page.waitForTimeout(3500);

  // 7. Verify that the STALE data did NOT overwrite the fresh data
  await expect(page.getByText('STALE PROMPT — Should NOT appear')).not.toBeVisible();
  await expect(page.getByText('FRESH PROMPT — Should appear')).toBeVisible();
});
