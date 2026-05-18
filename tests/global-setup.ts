import { encode } from 'next-auth/jwt';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import 'dotenv/config';

type Role = 'VIEWER' | 'EDITOR' | 'ADMIN';

type SeedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/**
 * Forge a NextAuth-compatible JWT and write it into a Playwright
 * storageState file. Using the same `encode` function that NextAuth
 * uses internally means `getServerSession` will accept the cookie.
 */
async function writeStorageState(user: SeedUser, file: string) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      'NEXTAUTH_SECRET is not set. Add it to .env (it is required for E2E tests to forge a session cookie).',
    );
  }

  const maxAge = 60 * 60; // 1 hour
  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    secret,
    maxAge,
  });

  const state = {
    cookies: [
      {
        name: 'next-auth.session-token',
        value: token,
        domain: 'localhost',
        path: '/',
        expires: Math.floor(Date.now() / 1000) + maxAge,
        httpOnly: true,
        secure: false,
        sameSite: 'Lax' as const,
      },
    ],
    origins: [],
  };

  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(state, null, 2), 'utf8');
}

const AUTH_DIR = path.resolve(__dirname, '.auth');

export const STORAGE_STATE = {
  viewer: path.join(AUTH_DIR, 'viewer.json'),
  editor: path.join(AUTH_DIR, 'editor.json'),
  admin: path.join(AUTH_DIR, 'admin.json'),
};

export default async function globalSetup() {
  await writeStorageState(
    { id: '1', name: 'Viewer User', email: 'viewer@test.local', role: 'VIEWER' },
    STORAGE_STATE.viewer,
  );
  await writeStorageState(
    { id: '2', name: 'Editor User', email: 'editor@test.local', role: 'EDITOR' },
    STORAGE_STATE.editor,
  );
  await writeStorageState(
    { id: '99', name: 'Admin User', email: 'admin@test.local', role: 'ADMIN' },
    STORAGE_STATE.admin,
  );
}
