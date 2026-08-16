"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { ICON_COLORS } from "@/components/icon-badge";
import { navItems } from "@/lib/nav-items";

const mainNavItems = navItems.filter((item) => item.url !== "/settings");
const settingsItem = navItems.find((item) => item.url === "/settings")!;

export function AppSidebar({
  username,
  connected,
  authEnabled,
}: {
  username: string | null;
  connected: boolean;
  authEnabled: boolean;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" onClick={closeOnMobile}>
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg text-white shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, var(--primary), var(--chart-5))",
                  }}
                >
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Creator Dashboard
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Reels analytics & agents
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="data-active:bg-transparent"
                      style={
                        isActive
                          ? {
                              backgroundColor: `color-mix(in oklab, ${ICON_COLORS[item.color]} 14%, transparent)`,
                              color: ICON_COLORS[item.color],
                            }
                          : undefined
                      }
                    >
                      <Link href={item.url} onClick={closeOnMobile}>
                        <item.icon
                          style={isActive ? { color: ICON_COLORS[item.color] } : undefined}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Settings" isActive={pathname.startsWith("/settings")}>
              <Link href={settingsItem.url} className="gap-3" onClick={closeOnMobile}>
                <Avatar size="sm">
                  <AvatarFallback
                    className="text-[0.7rem] font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--primary), var(--chart-5))",
                    }}
                  >
                    {username ? username.slice(0, 2).toUpperCase() : "?"}
                  </AvatarFallback>
                  <AvatarBadge
                    style={{
                      backgroundColor: connected ? "var(--delta-good)" : "var(--muted-foreground)",
                    }}
                  />
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-medium">
                    {username ? `@${username}` : "Not connected"}
                  </span>
                  <span className="truncate text-muted-foreground">
                    {connected ? "Connected · Settings" : "Connect Instagram"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {authEnabled && (
            <SidebarMenuItem>
              <form action="/api/auth/logout" method="POST">
                <SidebarMenuButton type="submit" tooltip="Log out">
                  <LogOut />
                  <span>Log out</span>
                </SidebarMenuButton>
              </form>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
