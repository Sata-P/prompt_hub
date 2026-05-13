"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/component/ui/sidebar";
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
      <div className="flex h-screen w-full overflow-hidden">
        {/* ── Sidebar (Full Height, Left) ── */}
        <AppSidebar user={session.user} />

        {/* ── Right side: header + content stacked ── */}
        <SidebarInset className="flex flex-col overflow-hidden min-h-0 h-full flex-1">
          {/* ── Top bar ── */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#2e1f5e]/60 bg-[#08011a] px-3 md:px-6 z-20 shadow-sm">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <SidebarTrigger className="shrink-0 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors" />
              <div className="shrink-0 h-4 w-px bg-white/15" />
              <span className="truncate text-sm md:text-base font-bold text-white/90">
                {pageTitle}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* User name */}
              <span className="text-xs md:text-sm font-medium text-white/60 hidden sm:block max-w-[100px] md:max-w-[150px] truncate">
                {session.user.name || session.user.email}
              </span>
              <div className="h-4 w-px bg-white/15 hidden sm:block" />
              <HeaderActions />
            </div>
          </header>

          {/* ── Page content ── */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto max-w-[1400px] w-full p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
