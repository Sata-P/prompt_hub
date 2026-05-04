"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/component/ui/sidebar";
import { AppSidebar } from "@/component/AppSidebar";
import { HeaderActions } from "@/component/HeaderActions";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Routes that should NOT have the sidebar/header shell */
const PUBLIC_ROUTES = ["/login", "/signup"];

/** Map route prefix → page title */
const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/prompts":      "Prompt Library",
  "/playground":   "Playground",
  "/favorites":    "Favorites",
  "/collections":  "Collections",
  "/activity_log": "Activity Log",
  "/settings":     "Settings",
};

function getPageTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(prefix)) return title;
  }
  return "Prompt Hub";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  if (isPublic) return <>{children}</>;
  return <ProtectedShell>{children}</ProtectedShell>;
}

function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading" || !session?.user) return null;

  const pageTitle = getPageTitle(pathname);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* ── Sidebar ── */}
        <AppSidebar user={session.user} />

        {/* ── Main area ── */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {/* ── Top bar: minimal, shows page title + actions ── */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#3D2410]/40 bg-[#2C1A0E] px-4 md:px-6 z-20 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors" />
              <div className="h-4 w-px bg-white/15 hidden sm:block" />
              <span className="text-sm font-semibold text-white/90 hidden sm:block">
                {pageTitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* User name */}
              <span className="text-sm font-medium text-white/60 hidden md:block">
                {session.user.name || session.user.email}
              </span>
              <div className="h-4 w-px bg-white/15 hidden md:block" />
              <HeaderActions />
            </div>
          </header>

          {/* ── Page content ── */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl w-full p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
