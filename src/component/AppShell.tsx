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
      <div className="flex flex-col min-h-screen w-full">
        {/* ── Top bar: Header (Full Width) ── */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#3D2410]/40 bg-[#2C1A0E] px-4 md:px-6 z-20 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <SidebarTrigger className="shrink-0 text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors" />
            <div className="shrink-0 h-4 w-px bg-white/15" />
            <span className="truncate text-sm font-semibold text-white/90">
              {pageTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* User name */}
            <span className="text-sm font-medium text-white/60 hidden md:block max-w-[150px] truncate">
              {session.user.name || session.user.email}
            </span>
            <div className="h-4 w-px bg-white/15 hidden md:block" />
            <HeaderActions />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* ── Sidebar (Below Header) ── */}
          <AppSidebar user={session.user} />

          {/* ── Main content (Below Header, Next to Sidebar) ── */}
          <SidebarInset className="overflow-hidden transition-all duration-200 ease-linear">
            {/* ── Page content ── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="mx-auto max-w-6xl w-full p-4 md:p-6 lg:p-8">
                {children}
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
