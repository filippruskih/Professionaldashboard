"use client";

import { usePathname } from "next/navigation";
import { TopHeader } from "@/components/top-header";
import { BottomNav } from "@/components/bottom-nav";

// The public marketing page and the login screen are their own full-bleed
// layouts, not dashboard views - neither should carry the app's
// TopHeader/BottomNav chrome (nav items like "Insights"/"Agents" make no
// sense to an anonymous visitor, and the bottom nav's floating pill would
// just overlap a login form).
const CHROME_LESS_PATHS = new Set(["/", "/login", "/signup"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (CHROME_LESS_PATHS.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <TopHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-32 md:p-6 md:pb-32">{children}</main>
      <BottomNav />
    </div>
  );
}
