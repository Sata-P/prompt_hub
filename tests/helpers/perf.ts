import { test, type Page } from '@playwright/test';

/**
 * Wall-clock timer that resolves once `predicate` becomes truthy.
 * Used to measure "time from navigation → meaningful content visible".
 */
export async function timeUntil(label: string, fn: () => Promise<void>): Promise<number> {
  const t0 = Date.now();
  await fn();
  const elapsed = Date.now() - t0;
  attach('timing', `${label}: ${elapsed} ms`);
  return elapsed;
}

/** Count all DOM nodes on the page — sanity check for "is pagination really capping render?" */
export async function domNodeCount(page: Page): Promise<number> {
  const n = await page.evaluate(() => document.querySelectorAll('*').length);
  attach('dom', `node count: ${n}`);
  return n;
}

/**
 * Collect Web Vitals (LCP, CLS) using PerformanceObserver from the page.
 * Returns LCP in ms and a unitless CLS score (smaller is better).
 *
 * Note: LCP is "buffered" so it captures the largest paint up to the call
 * time. Call this AFTER the meaningful content has rendered.
 */
export async function webVitals(page: Page, samplingMs = 1500): Promise<{ lcp: number | null; cls: number }> {
  const result = await page.evaluate((ms) => {
    return new Promise<{ lcp: number | null; cls: number }>((resolve) => {
      let lcp: number | null = null;
      let cls = 0;

      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          if (last) lcp = last.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // type not supported in this browser
      }

      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
            if (!entry.hadRecentInput) cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch {
        // not supported
      }

      setTimeout(() => resolve({ lcp, cls }), ms);
    });
  }, samplingMs);

  attach('web-vitals', `LCP: ${result.lcp == null ? 'n/a' : `${Math.round(result.lcp)} ms`}, CLS: ${result.cls.toFixed(4)}`);
  return result;
}

/** Tracker for API requests fired during a test. Attach early, read at the end. */
export function trackApiRequests(page: Page, urlIncludes: string) {
  const urls: string[] = [];
  page.on('request', (req) => {
    if (req.url().includes(urlIncludes)) urls.push(req.url());
  });
  return {
    urls,
    count: () => urls.length,
    report: (label: string) => attach('requests', `${label}: ${urls.length} request(s) to ${urlIncludes}`),
  };
}

/** Attach a metric to the current Playwright test (visible in HTML report) AND log it. */
function attach(type: string, description: string) {
  // eslint-disable-next-line no-console
  console.log(`  [${type}] ${description}`);
  try {
    test.info().annotations.push({ type, description });
  } catch {
    // outside a running test
  }
}
