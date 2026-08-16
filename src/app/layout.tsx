import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import { ScrollSpyProvider } from "@/components/scroll-spy-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { db } from "@/lib/db";
import { isAuthEnabled } from "@/lib/auth";
import { navItems } from "@/lib/nav-items";

const sectionIds = navItems.map((item) => item.sectionId);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creator Dashboard",
  description: "Personal Instagram Reels analytics & content agents",
  // app/manifest.ts is an automatic file convention — Next injects the
  // <link rel="manifest"> itself, no need to reference it here.
  icons: {
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dashboard",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#574ede" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f10" },
  ],
};

// The layout itself queries the DB (for the sidebar/header account chip),
// so every route — including /_not-found — needs this to skip static
// prerendering rather than requiring a live DB connection at build time.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const account = await db.account.findFirst();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <RegisterServiceWorker />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <ScrollSpyProvider sectionIds={sectionIds}>
              <SidebarProvider>
                <AppSidebar
                  username={account?.username ?? null}
                  connected={!!account}
                  authEnabled={isAuthEnabled()}
                />
                <SidebarInset>
                  <AppHeader />
                  <main className="flex flex-1 flex-col gap-4 bg-background p-4 md:p-6">
                    {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
            </ScrollSpyProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
