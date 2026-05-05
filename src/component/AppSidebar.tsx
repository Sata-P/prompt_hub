"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  PlayCircle,
  Star,
  ClipboardClock,
  Zap,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/component/ui/sidebar";
import { Avatar, AvatarFallback } from "@/component/ui/avatar";

const navItems = [
  { label: "Dashboard",    icon: LayoutDashboard, path: "/dashboard" },
  { label: "Prompts",      icon: FileText,         path: "/prompts" },
  { label: "Playground",   icon: PlayCircle,        path: "/playground" },
  { label: "Favorites",    icon: Star,              path: "/favorites" },
  { label: "Collections",  icon: FolderOpen,        path: "/collections" },
  { label: "Activity Log", icon: ClipboardClock,    path: "/activity_log" },
  { label: "Settings",     icon: Settings,          path: "/settings" },
];

export function AppSidebar({
  user,
}: {
  user: {
    email?: string | null;
    name?: string | null;
    role?: string | null;
    image?: string | null;
    id?: string;
  };
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* ── Logo / Brand ── */}
      <SidebarHeader className="h-14 flex items-center border-b border-sidebar-border px-3 py-2">
        <div className="flex w-full items-center gap-3 overflow-hidden">
          {/* Icon mark */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary shadow-sm">
            <Zap className="h-4 w-4 text-white" fill="white" />
          </div>

          {!collapsed && (
            <div className="flex flex-col truncate leading-none">
              <span className="truncate text-[15px] font-bold tracking-tight text-sidebar-foreground">
                Prompt Hub
              </span>
              <span className="truncate text-[10px] font-medium text-sidebar-muted-foreground mt-0.5">
                Soft&apos;Debut
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted-foreground">
              Menu
            </p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                if (item.path === "/settings" && user.role !== "ADMIN") return null;
                if (item.path === "/activity_log" && user.role !== "ADMIN") return null;

                const isActive =
                  item.path === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : pathname.startsWith(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive}
                      className={[
                        "relative h-10 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                        "text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-white/8",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full before:bg-sidebar-primary"
                          : "",
                      ].join(" ")}
                    >
                      <Link href={item.path} className="flex items-center gap-3">
                        <item.icon
                          className={[
                            "h-4 w-4 shrink-0",
                            isActive ? "text-sidebar-primary" : "",
                          ].join(" ")}
                        />
                        <span className="flex-1">{item.label}</span>
                        {isActive && !collapsed && (
                          <ChevronRight className="h-3 w-3 opacity-50" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── User Footer ── */}
      <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-sidebar-primary/30">
            <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden flex-1 min-w-0">
              <span className="text-[13px] font-semibold truncate text-sidebar-foreground leading-tight">
                {user.name || "User"}
              </span>
              <span className="text-[11px] text-sidebar-muted-foreground truncate">
                {user.role?.toLowerCase() || "member"}
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
