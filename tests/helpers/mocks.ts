import type { Page, Route } from '@playwright/test';

export type Role = 'VIEWER' | 'EDITOR' | 'ADMIN';

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export const VIEWER_USER: MockUser = {
  id: '1',
  name: 'Viewer User',
  email: 'viewer@test.local',
  role: 'VIEWER',
};

export const EDITOR_USER: MockUser = {
  id: '2',
  name: 'Editor User',
  email: 'editor@test.local',
  role: 'EDITOR',
};

export const ADMIN_USER: MockUser = {
  id: '99',
  name: 'Admin User',
  email: 'admin@test.local',
  role: 'ADMIN',
};

// Back-compat alias for older specs.
export const DEFAULT_USER = VIEWER_USER;

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

export type MockPrompt = {
  id: number;
  title: string;
  description: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'REVIEW' | 'REJECTED';
  latest_version_no: number;
  created_at: string;
  updated_at: string;
  category: { id: number; name: string } | null;
  tags: { id: number; name: string }[];
  recommended_models: string[] | null;
  visibility?: 'PUBLIC' | 'PRIVATE';
};

export const samplePrompts: MockPrompt[] = [
  {
    id: 1,
    title: 'Summarize Article',
    description: 'Summarizes a long article in 3 bullets.',
    status: 'PUBLISHED',
    latest_version_no: 2,
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: '2026-05-10T00:00:00.000Z',
    category: { id: 1, name: 'Writing' },
    tags: [{ id: 1, name: 'summary' }],
    recommended_models: ['gpt-4o-mini'],
    visibility: 'PUBLIC',
  },
  {
    id: 2,
    title: 'Draft Email Reply',
    description: 'Composes a polite email reply.',
    status: 'DRAFT',
    latest_version_no: 1,
    created_at: '2026-04-20T00:00:00.000Z',
    updated_at: '2026-05-05T00:00:00.000Z',
    category: { id: 2, name: 'Productivity' },
    tags: [{ id: 2, name: 'email' }],
    recommended_models: ['gpt-4o'],
    visibility: 'PRIVATE',
  },
];

export const sampleCategories = [
  { id: 1, name: 'Writing' },
  { id: 2, name: 'Productivity' },
  { id: 3, name: 'Coding' },
];

export const sampleTags = [
  { id: 1, name: 'summary' },
  { id: 2, name: 'email' },
  { id: 3, name: 'react' },
];

/**
 * Install a mocked NextAuth session so any page using `useSession`
 * or server-side `getServerAuthSession` (via /api/auth/session) sees
 * the given user as logged in.
 */
export async function mockSession(page: Page, user: MockUser | null = DEFAULT_USER) {
  await page.route('**/api/auth/session', (route) =>
    json(
      route,
      user
        ? {
            user,
            expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          }
        : {},
    ),
  );

  await page.route('**/api/auth/csrf', (route) =>
    json(route, { csrfToken: 'mock-csrf-token' }),
  );
}

/**
 * Mock the NextAuth credentials sign-in endpoint.
 * `success: true` returns { url } (which next-auth interprets as ok),
 * `false` returns an error message.
 */
export async function mockCredentialsSignIn(
  page: Page,
  { success = true, error = 'Invalid email or password' }: { success?: boolean; error?: string } = {},
) {
  await page.route('**/api/auth/callback/credentials**', (route) =>
    json(
      route,
      success
        ? { url: 'http://localhost:3000/dashboard' }
        : { url: 'http://localhost:3000/login?error=' + encodeURIComponent(error), error },
    ),
  );

  await page.route('**/api/auth/signout', (route) => json(route, { url: '/' }));
}

/**
 * Mock prompts list + CRUD + categories + tags + dashboard stats.
 * Pass a mutable `prompts` array to capture POST/PATCH/DELETE writes
 * if you want to assert against them inside the test.
 */
export async function mockPromptApi(
  page: Page,
  opts: {
    prompts?: MockPrompt[];
    categories?: { id: number; name: string }[];
    tags?: { id: number; name: string }[];
    /** Artificial server latency in ms applied to every mocked route. */
    latencyMs?: number;
  } = {},
) {
  const prompts = opts.prompts ?? [...samplePrompts];
  const categories = opts.categories ?? sampleCategories;
  const tags = opts.tags ?? sampleTags;
  const delay = opts.latencyMs ?? 0;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  await page.route('**/api/categories', async (route) => {
    if (delay) await sleep(delay);
    return json(route, categories);
  });
  await page.route('**/api/tags', async (route) => {
    if (delay) await sleep(delay);
    return json(route, tags);
  });

  await page.route('**/api/prompts?**', async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    if (delay) await sleep(delay);
    const url = new URL(route.request().url());
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';
    const status = url.searchParams.get('status') ?? undefined;
    const categoryId = url.searchParams.get('categoryId');
    const page_ = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.max(1, Number(url.searchParams.get('limit')) || 20);

    let filtered = prompts.filter((p) => {
      if (q && !`${p.title} ${p.description ?? ''}`.toLowerCase().includes(q)) return false;
      if (status && p.status !== status) return false;
      if (categoryId && String(p.category?.id) !== categoryId) return false;
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    filtered = filtered.slice((page_ - 1) * limit, page_ * limit);

    return json(route, {
      data: filtered,
      pagination: { total, page: page_, limit, totalPages },
    });
  });

  await page.route('**/api/prompts', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    const body = route.request().postDataJSON?.() ?? {};
    const newPrompt: MockPrompt = {
      id: prompts.length + 100,
      title: body.title ?? 'Untitled',
      description: body.description ?? null,
      status: 'DRAFT',
      latest_version_no: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: sampleCategories.find((c) => c.id === Number(body.categoryId)) ?? null,
      tags: (body.tags ?? []).map((name: string, i: number) => ({ id: 1000 + i, name })),
      recommended_models: body.recommendedModels ?? null,
      visibility: 'PRIVATE',
    };
    prompts.push(newPrompt);
    return json(route, newPrompt, 201);
  });

  await page.route('**/api/prompts/*', async (route) => {
    const url = new URL(route.request().url());
    const id = Number(url.pathname.split('/').pop());
    const method = route.request().method();
    const prompt = prompts.find((p) => p.id === id);

    if (!prompt) return json(route, { error: 'Not found' }, 404);

    if (method === 'GET') {
      return json(route, {
        ...prompt,
        recommended_models: prompt.recommended_models ?? [],
        versions: [
          {
            id: 1,
            version_no: prompt.latest_version_no,
            template_content: 'Hello {{name}}',
            promptVariables: [
              {
                id: 1,
                name: 'name',
                type: 'TEXT',
                label: 'Name',
                description: null,
                options_json: null,
              },
            ],
          },
        ],
      });
    }
    if (method === 'PATCH' || method === 'PUT') {
      const body = route.request().postDataJSON?.() ?? {};
      Object.assign(prompt, body, { updated_at: new Date().toISOString() });
      return json(route, prompt);
    }
    if (method === 'DELETE') {
      const idx = prompts.findIndex((p) => p.id === id);
      if (idx >= 0) prompts.splice(idx, 1);
      return json(route, { ok: true });
    }
    return route.fallback();
  });

  await page.route('**/api/dashboard/stats', (route) =>
    json(route, {
      totalPrompts: prompts.length,
      byStatus: {
        DRAFT: prompts.filter((p) => p.status === 'DRAFT').length,
        REVIEW: prompts.filter((p) => p.status === 'REVIEW').length,
        PUBLISHED: prompts.filter((p) => p.status === 'PUBLISHED').length,
        REJECTED: prompts.filter((p) => p.status === 'REJECTED').length,
        ARCHIVED: prompts.filter((p) => p.status === 'ARCHIVED').length,
      },
      systemByStatus: {
        PUBLISHED: prompts.filter((p) => p.status === 'PUBLISHED').length,
        REVIEW: prompts.filter((p) => p.status === 'REVIEW').length,
      },
      recentPrompts: prompts.slice(0, 5),
      systemTotalPrompts: prompts.length,
    }),
  );

  return prompts;
}

/**
 * Mock the admin users endpoint.
 */
export async function mockUserApi(page: Page) {
  await page.route('**/api/users', (route) =>
    json(route, [
      { id: 1, name: 'Test User', email: 'test@example.com', role: 'USER' },
      { id: 2, name: 'Editor', email: 'editor@example.com', role: 'EDITOR' },
      { id: 99, name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
    ]),
  );
}
