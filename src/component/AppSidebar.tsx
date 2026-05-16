"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Settings,
  PlayCircle,
  Star,
  Activity,
  ChevronRight,
  ChevronDown,
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
  { label: "Dashboard",    icon: LayoutDashboard,     path: "/dashboard" },
  { label: "Prompts",      icon: FileText,       path: "/prompts" },
  { label: "Playground",   icon: PlayCircle,     path: "/playground" },
  { label: "Favorites",    icon: Star,           path: "/favorites" },
  { label: "Collections",  icon: Folder,         path: "/collections" },
  { label: "Activity Log", icon: Activity,       path: "/activity_log" },
  { label: "Settings",     icon: Settings,       path: "/settings" },
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
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <Sidebar collapsible="offcanvas" className="md:w-[280px] border-r-0 sidebar-custom-bg overflow-hidden">
      {/* ── Logo / Brand ── */}
      <SidebarHeader className="h-20 flex px-6 pt-6 overflow-hidden"> 
        <div className="flex items-center gap-3">
          {/* Brand Icon Wrapper */}
          <div className="relative">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <span className="text-lg font-bold tracking-tight text-white">
            Prompt Hub
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-2 pb-4 scrollbar-hide">
        <SidebarGroup>
          <p className="px-3 mb-4 text-xs font-medium uppercase tracking-wider text-gray-500">
            Menu
          </p>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                if (item.path === "/settings" && user.role !== "ADMIN") return null;
                if (item.path === "/activity_log" && user.role !== "ADMIN") return null;

                const isActive = item.path === "/dashboard" 
                  ? pathname === "/dashboard" || pathname === "/"
                  : pathname.startsWith(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive}
                      className={[
                        "relative h-[52px] rounded-xl px-4 text-[15px] font-medium transition-all duration-200 hover:cursor-pointer",
                        isActive
                          ? "bg-gradient-to-l from-[#FF6B00] to-[#FF6B00]/20 text-white shadow-lg shadow-orange-500/50"
                          : "text-gray-400 hover:text-white hover:bg-white/5 hover:font-semibold",
                      ].join(" ")}
                    >
                      <Link href={item.path} className="flex items-center gap-3.5">
                        <item.icon
                          className={[
                            "h-[22px] w-[22px] shrink-0",
                            isActive ? "text-white" : "text-gray-400"
                          ].join(" ")}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {isActive && (
                          <ChevronRight className="h-4 w-4 text-white" strokeWidth={2.5} />
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

      <SidebarFooter className="mt-auto p-4 border-t border-white/5 bg-transparent">
        <div className="flex w-full items-center gap-3 rounded-lg p-2 transition-all duration-200 hover:bg-white/5 cursor-pointer">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F97316] text-sm font-bold text-white shadow-md shadow-orange-500/20">
            {user.name?.substring(0, 2).toUpperCase() || "AT"}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden text-left">
            <span className="truncate text-sm font-semibold text-white">
              {user.name || "admin test"}
            </span>
            <span className="truncate text-[10px] text-gray-400 uppercase tracking-wide">
              {user.role || "admin"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
