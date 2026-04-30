"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Settings,
  PlayCircle,
  Sparkles,
  Star,
  Pin,
  ClipboardClock
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/component/ui/sidebar";
import { Avatar, AvatarFallback } from "@/component/ui/avatar";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Prompts", icon: FileText, path: "/prompts" },
  { label: "Playground", icon: PlayCircle, path: "/playground" },
  { label: "Favorites", icon: Pin, path: "/favorites" },
  { label: "Collections", icon: FolderOpen, path: "/collections" },
  { label: "Activity Log", icon: ClipboardClock, path: "/activity_log" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar({ user }: { user: { email?: string | null; name?: string | null; role?: string | null; image?: string | null; id?: string } }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="h-14 flex items-center border-b border-sidebar-border px-4 py-2">
        <div className="flex w-full items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="truncate font-bold tracking-tight text-sidebar-foreground">PromptHub</span>
              <span className="truncate text-[10px] text-sidebar-muted-foreground/70">Internal Prompt Library</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                if (item.path === "/settings" && user.role !== "ADMIN") return null;
                if (item.path === "/activity_log" && user.role !== "ADMIN") return null;
                const isActive =
                  item.path === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : pathname.startsWith(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                      <Link href={item.path}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 py-3 px-3 overflow-hidden">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {user.email?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate leading-tight">
                {user.name || "User"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
