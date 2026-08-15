"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconBadge } from "@/components/icon-badge";
import { navItemForPath } from "@/lib/nav-items";

export function AppHeader() {
  const pathname = usePathname();
  const active = navItemForPath(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/70 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      {active && (
        <div className="flex items-center gap-2">
          <IconBadge icon={active.icon} color={active.color} size="sm" />
          <span className="text-sm font-medium">{active.title}</span>
        </div>
      )}
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
