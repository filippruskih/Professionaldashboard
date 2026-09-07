"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNavItems, isNavItemActive } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

// Monochrome by design — color is reserved for the logo mark alone,
// matching Instagram's own bottom nav (black/white icons, no per-tab hue).
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/85"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {bottomNavItems.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <Link
              key={item.key}
              href={item.url}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.7rem] transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-6" strokeWidth={active ? 2.4 : 1.8} />
              <span className={active ? "font-semibold" : "font-medium"}>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
