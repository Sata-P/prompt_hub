import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

/**
 * Proxy (Next.js 16 convention, replaces middleware).
 * Protects authenticated routes:
 * - API routes → returns 401
 * - Page routes → redirects to /login
 */
export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // If no token and trying to access protected route
  if (!token) {
    // API routes → return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Page routes → redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Match all routes that require authentication.
 * Excludes: /login, /signup, /api/auth/*, static files, etc.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/prompts/:path*",
    "/collections/:path*",
    "/settings/:path*",
    "/api/prompts/:path*",
    "/api/categories/:path*",
    "/api/tags/:path*",
    "/api/dashboard/:path*",
  ],
};
