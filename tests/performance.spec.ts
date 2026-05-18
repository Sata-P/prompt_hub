import { test, expect } from '@playwright/test';
import { mockPromptApi, type MockPrompt } from './helpers/mocks';
import { domNodeCount, timeUntil, trackApiRequests, webVitals } from './helpers/perf';

function makePrompt(i: number): MockPrompt {
  return {
    id: i,
    title: `Stress Prompt ${i}`,
    description: `Generated entry #${i} used for heavy-data UX testing.`,
    status: 'PUBLISHED',
    latest_version_no: 1,
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: '2026-05-01T00:00:00.000Z',
    category: { id: (i % 5) + 1, name: `Category ${(i % 5) + 1}` },
    tags: [{ id: i, name: `tag-${i % 20}` }],
    recommended_models: i % 2 === 0 ? ['gpt-4o-mini'] : null,
    visibility: 'PUBLIC',
  };
}

// These tests are about UX-under-load, not micro-benchmarks. Numbers will
// vary by machine — they are LOGGED, not strictly asserted. The hard
// asserts target invariants that should NOT change with dataset size:
//   - pagination caps DOM
//   - skeleton appears before content on a slow API
//   - debounce still fires only one request
test.describe('Performance & heavy-data UX', () => {
  test('1,000 prompts: pagination caps DOM + content lands within budget', async ({ page }) => {
    const many = Array.from({ length: 1000 }, (_, i) => makePrompt(i + 1));
    await mockPromptApi(page, { prompts: many });

    const elapsed = await timeUntil('time-to-content', async () => {
      await page.goto('/prompts');
      await expect(page.getByText('Prompt Library')).toBeVisible();
      // Wait for the first row to render — that's when the page is "useful".
      await page.getByRole('link', { name: 'Stress Prompt 1', exact: true }).waitFor();
    });

    // 20 items per page → far fewer DOM nodes than 1000 rows would produce.
    const nodes = await domNodeCount(page);

    // Web Vitals — gives us a comparable LCP/CLS number even under stress.
    await webVitals(page);

    // Pagination footer should say "Page 1 of 50" (1000 / 20).
    await expect(page.getByText(/Page 1 of 50/)).toBeVisible();

    // Soft budget: time-to-content under 8s on a typical dev box.
    // Treat as a smoke threshold, not a perf SLA.
    expect(elapsed).toBeLessThan(8000);

    // Hard invariant: render isn't blowing up. 20 rows × ~10 nodes/row plus
    // chrome should sit well under 3000. If this regresses, someone removed
    // pagination by accident.
    expect(nodes).toBeLessThan(3000);
  });

  test('slow API (1.5s latency): shell lands fast, content lands after the wait', async ({ page }) => {
    const many = Array.from({ length: 200 }, (_, i) => makePrompt(i + 1));
    await mockPromptApi(page, { prompts: many, latencyMs: 1500 });

    const navStart = Date.now();
    await page.goto('/prompts', { waitUntil: 'commit' });

    // Header is rendered by the shell and does NOT wait on data → should be fast.
    await page.getByText('Prompt Library').waitFor();
    const tHeader = Date.now() - navStart;

    // First data row arrives only after the latency window completes.
    await page.getByRole('link', { name: 'Stress Prompt 1', exact: true }).waitFor({ timeout: 8000 });
    const tContent = Date.now() - navStart;

    // eslint-disable-next-line no-console
    console.log(`  [timing] header→visible: ${tHeader} ms, content→visible: ${tContent} ms (api latency=1500ms)`);
    test.info().annotations.push({
      type: 'timing',
      description: `header ${tHeader}ms, content ${tContent}ms (latency 1500ms)`,
    });

    // Hard UX invariant: the shell appeared well before the data did.
    // i.e. the user is NOT staring at a blank screen for the full request.
    expect(tHeader).toBeLessThan(tContent);
    expect(tContent - tHeader).toBeGreaterThan(500);
  });

  test('debounce holds under slow network: 1 request per typing burst', async ({ page }) => {
    await mockPromptApi(page, { latencyMs: 600 });

    const tracker = trackApiRequests(page, '/api/prompts?');

    await page.goto('/prompts');
    await expect(page.getByText('Prompt Library')).toBeVisible();
    // Reset counter — only count requests fired AFTER the initial load.
    tracker.urls.length = 0;

    await page.getByPlaceholder('Search prompts...').pressSequentially('summarize', { delay: 25 });

    // 300ms debounce + 600ms latency + slack
    await page.waitForTimeout(1200);

    tracker.report('search debounce under 600ms latency');

    // Hard invariant: regardless of latency, exactly one request fires for
    // the burst. If debounce ever breaks, this jumps to ~9.
    expect(tracker.count()).toBe(1);
  });

  test('200 categories + 200 tags: filter dropdowns stay usable', async ({ page }) => {
    const manyCategories = Array.from({ length: 200 }, (_, i) => ({
      id: i + 1,
      name: `Category ${i + 1}`,
    }));
    const manyTags = Array.from({ length: 200 }, (_, i) => ({
      id: i + 1,
      name: `tag-${i + 1}`,
    }));
    await mockPromptApi(page, {
      prompts: Array.from({ length: 50 }, (_, i) => makePrompt(i + 1)),
      categories: manyCategories,
      tags: manyTags,
    });

    await page.goto('/prompts');
    await expect(page.getByText('Prompt Library')).toBeVisible();

    // Open the Category select and measure how long until the first option
    // is visible. Radix renders options lazily inside a Portal.
    const tCategory = await timeUntil('open category dropdown', async () => {
      await page.locator('button[role="combobox"]:has-text("All Categories")').click();
      await page.getByRole('option', { name: 'Category 1', exact: true }).waitFor();
    });

    // Close it before opening the tag popover.
    await page.keyboard.press('Escape');

    // Tag picker is a Popover + Command (cmdk). Its trigger uses
    // role="combobox", not role="button".
    const tTagOpen = await timeUntil('open tag popover', async () => {
      await page.locator('button[role="combobox"]').filter({ hasText: 'Select tags...' }).click();
      await page.getByRole('option', { name: '#tag-1', exact: true }).waitFor();
    });

    // Type inside cmdk to filter — should still feel instant with 200 items.
    const tTagFilter = await timeUntil('filter tag popover to "tag-150"', async () => {
      await page.getByPlaceholder('Search tags...').fill('tag-150');
      await page.getByRole('option', { name: '#tag-150', exact: true }).waitFor();
    });

    // Soft budget: dropdown open + filter feels instant if < 1s each.
    expect(tCategory).toBeLessThan(2000);
    expect(tTagOpen).toBeLessThan(2000);
    expect(tTagFilter).toBeLessThan(2000);
  });
});
