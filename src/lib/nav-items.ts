import {
  Bot,
  Grid3x3,
  Home,
  MessageCircle,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";
import type { IconBadgeColor } from "@/components/icon-badge";

export interface NavItem {
  key: string;
  title: string;
  url: string;
  icon: LucideIcon;
  color: IconBadgeColor;
  // Pathname prefixes that count as "this tab is active" — e.g. Content
  // covers /reels, /posts, /series and their detail pages even though its
  // own link points at /reels.
  matchPrefixes: string[];
}

// The five bottom-bar tabs, in display order — mirrors Instagram's own
// bottom nav (Home / grid-style content / notifications-ish / profile),
// adapted to this app's sections. Reels, Posts, Series, and Scanner are
// four real pages grouped under one "Content" tab via the ContentTabs
// strip, rather than merged into a single page — each keeps its own state.
export const bottomNavItems: NavItem[] = [
  { key: "home", title: "Home", url: "/", icon: Home, color: "blue", matchPrefixes: ["/"] },
  {
    key: "content",
    title: "Content",
    url: "/reels",
    icon: Grid3x3,
    color: "orange",
    matchPrefixes: ["/reels", "/posts", "/series", "/scanner"],
  },
  {
    key: "insights",
    title: "Insights",
    url: "/insights",
    icon: TrendingUp,
    color: "aqua",
    matchPrefixes: ["/insights", "/content-dna"],
  },
  {
    key: "agents",
    title: "Agents",
    url: "/agents",
    icon: Bot,
    color: "yellow",
    matchPrefixes: ["/agents"],
  },
  {
    key: "profile",
    title: "Profile",
    url: "/profile",
    icon: User,
    color: "magenta",
    matchPrefixes: ["/profile", "/settings"],
  },
];

// DMs lives in the header (top-right icon), matching Instagram's own
// placement of the paper-plane/DM icon outside the bottom bar.
export const headerNavItem: NavItem = {
  key: "dms",
  title: "DMs",
  url: "/dms",
  icon: MessageCircle,
  color: "blue",
  matchPrefixes: ["/dms"],
};

function isItemActive(item: NavItem, pathname: string): boolean {
  return item.matchPrefixes.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname.startsWith(prefix)
  );
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return isItemActive(item, pathname);
}

// Used by the header's small "you are here" breadcrumb.
export function getActiveNavItem(pathname: string): NavItem {
  return (
    [...bottomNavItems, headerNavItem].find((item) => isItemActive(item, pathname)) ??
    bottomNavItems[0]
  );
}
