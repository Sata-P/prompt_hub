"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/component/ui/sidebar";
import { AppSidebar } from "@/component/AppSidebar";
import { HeaderActions } from "@/component/HeaderActions";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, FileText } from "lucide-react";

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
          <header className="min-[1300px]:hidden flex h-16 shrink-0 items-center justify-between border-b border-[#2e1f5e]/60 bg-[#08011a] px-4 z-20 shadow-sm">
            {/* Left: Brand Logo & Text */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F97316] shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                Prompt Hub
              </span>
            </div>

            {/* Right: Hamburger menu only */}
            <SidebarTrigger className="min-[1300px]:hidden h-10 w-10 shrink-0 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </header>

          {/* ── Page content ── */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto max-w-[1400px] w-full p-4 min-[1300px]:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
