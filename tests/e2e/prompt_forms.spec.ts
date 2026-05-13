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
const MOCK_CATEGORIES = [
  { id: 1, name: 'Development' },
  { id: 2, name: 'Testing' },
];

const MOCK_MODELS = {
  models: [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'claude-3', name: 'Claude 3' },
  ],
  defaultModel: 'gpt-4',
};

const MOCK_TAGS = [
  { id: 1, name: 'api' },
  { id: 2, name: 'testing' },
];

const MOCK_PROMPT_DETAIL = {
  id: 1,
  title: 'Original Prompt Title',
  description: 'Original Description',
  status: 'PUBLISHED',
  recommended_model: 'gpt-4',
  category: { id: 1, name: 'Development' },
  tags: [{ id: 1, name: 'api' }],
  versions: [
    {
      id: 1,
      version_no: 1,
      template_content: 'Hello {{name}}, welcome to {{place}}!',
      promptVariables: [
        { id: 1, name: 'name', type: 'TEXT', label: 'Name', description: 'User name', options_json: null },
        { id: 2, name: 'place', type: 'TEXT', label: 'Place', description: 'Destination', options_json: null },
      ],
    },
  ],
};

test.describe('Prompt Forms (New & Edit)', () => {

  test.beforeEach(async ({ page }) => {
    // Mock common lookups
    await page.route('**/api/categories', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CATEGORIES) });
    });
    await page.route('**/api/llm/models', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MODELS) });
    });
    await page.route('**/api/tags', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TAGS) });
    });
  });

  // =================================================================
  // CREATE PROMPT PAGE
  // =================================================================
  test.describe('Create Prompt Page', () => {
    
    test('Should render all form fields', async ({ page }) => {
      await login(page);
      await page.goto('http://localhost:3000/prompts/new');

      await expect(page.getByRole('heading', { name: 'Create New Prompt' })).toBeVisible();
      await expect(page.getByLabel(/Prompt Title/i)).toBeVisible();
      await expect(page.getByLabel(/Description/i)).toBeVisible();
      await expect(page.getByPlaceholder(/Type your prompt template here/i)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save Prompt' })).toBeVisible();
    });

    test('Should validate required fields', async ({ page }) => {
      await login(page);
      await page.goto('http://localhost:3000/prompts/new');

      // Click save without filling anything
      await page.getByRole('button', { name: 'Save Prompt' }).click();

      // Should show validation error (handled by HTML5 required or custom state)
      // If it's HTML5 required, Playwright might not see a "text" error unless we check validity.
      // But looking at the code, line 188 has: if (!title || !templateContent) { setError(...) }
      await expect(page.getByText('Title and template content are required.')).toBeVisible();
    });

    test('Should detect variables from template', async ({ page }) => {
      await login(page);
      await page.goto('http://localhost:3000/prompts/new');

      const templateArea = page.getByPlaceholder(/Type your prompt template here/i);
      await templateArea.fill('Hello {{user_name}}, today is {{day}}.');

      // Check if variables are detected
      await expect(page.getByText('Detected Variables (2)')).toBeVisible();
      await expect(page.getByText('{{user_name}}')).toBeVisible();
      await expect(page.getByText('{{day}}')).toBeVisible();
    });

    test('Should successfully create a prompt', async ({ page }) => {
      // Mock the POST request
      await page.route('**/api/prompts', async (route) => {
        const request = route.request();
        if (request.method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ id: 123 }), // Return mock ID
          });
        } else {
          await route.continue();
        }
      });

      await login(page);
      await page.goto('http://localhost:3000/prompts/new');

      await page.getByLabel(/Prompt Title/i).fill('E2E Test Prompt');
      await page.getByPlaceholder(/Type your prompt template here/i).fill('Generate a {{topic}} about {{subject}}');
      
      // Click save
      await page.getByRole('button', { name: 'Save Prompt' }).click();

      // Should redirect to detail page
      await expect(page).toHaveURL(/\/prompts\/123/);
    });
  });

  // =================================================================
  // EDIT PROMPT PAGE
  // =================================================================
  test.describe('Edit Prompt Page', () => {

    test.beforeEach(async ({ page }) => {
      // Mock the GET request for the specific prompt
      await page.route('**/api/prompts/1', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_PROMPT_DETAIL),
          });
        }
      });
    });

    test('Should pre-fill form with existing data', async ({ page }) => {
      await login(page);
      await page.goto('http://localhost:3000/prompts/1/edit');

      // Check if data is loaded
      await expect(page.getByLabel(/Prompt Title/i)).toHaveValue('Original Prompt Title');
      await expect(page.getByLabel(/Description/i)).toHaveValue('Original Description');
      await expect(page.getByPlaceholder(/Type your prompt template here/i)).toHaveValue('Hello {{name}}, welcome to {{place}}!');
      
      // Check detected variables
      await expect(page.getByText('Detected Variables (2)')).toBeVisible();
      await expect(page.getByText('{{name}}')).toBeVisible();
      await expect(page.getByText('{{place}}')).toBeVisible();
    });

    test('Should successfully update prompt and create new version', async ({ page }) => {
      let patchCalled = false;
      let versionPostCalled = false;

      // Mock the PATCH request for prompt details
      await page.route('**/api/prompts/1', async (route) => {
        if (route.request().method() === 'PATCH') {
          patchCalled = true;
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
        }
      });

      // Mock the POST request for new version
      await page.route('**/api/prompts/1/versions', async (route) => {
        if (route.request().method() === 'POST') {
          versionPostCalled = true;
          await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 2 }) });
        }
      });

      await login(page);
      await page.goto('http://localhost:3000/prompts/1/edit');

      // Edit title
      await page.getByLabel(/Prompt Title/i).fill('Updated Prompt Title');
      
      // Click save
      await page.getByRole('button', { name: 'Save Changes' }).click();

      // Verify API calls were made
      expect(patchCalled).toBeTruthy();
      expect(versionPostCalled).toBeTruthy();

      // Should redirect back to detail page
      await expect(page).toHaveURL(/\/prompts\/1/);
    });
  });
});
