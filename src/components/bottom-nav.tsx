"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNavItems, isNavItemActive } from "@/lib/nav-items";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Floating pill, inset from the screen edges — sitting flush against the
// bottom edge put it right where iOS's home-indicator swipe gesture lives,
// making it too easy to trigger that instead of tapping a tab. Icon-only,
// monochrome, matching Instagram's own bottom nav (color is reserved for
// the logo alone).
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
    >
      <div className="flex w-full max-w-xs items-stretch justify-around rounded-full border bg-background/95 px-2 py-2 shadow-lg backdrop-blur-sm supports-backdrop-filter:bg-background/90">
        {bottomNavItems.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>
                <Link
                  href={item.url}
                  aria-label={item.title}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full transition-colors",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="size-6" strokeWidth={active ? 2.4 : 1.8} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">{item.title}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </nav>
  );
}
