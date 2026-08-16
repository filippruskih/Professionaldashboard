import {
  Bot,
  Dna,
  Film,
  Image as ImageIcon,
  LayoutDashboard,
  ListTree,
  MessageCircle,
  Settings,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { IconBadgeColor } from "@/components/icon-badge";

export interface NavItem {
  title: string;
  // Anchor id of this section's <section id="..."> on the home page —
  // sidebar/header links point at `/#${sectionId}` and scroll there.
  sectionId: string;
  // The standalone route this section's content also lives at, if any
  // (Reels/Posts keep real paginated pages; Series keeps /series/[id]
  // detail pages). Used to detect "active" via pathname on non-home pages.
  url: string;
  icon: LucideIcon;
  color: IconBadgeColor;
  description: string;
}

// Single source of truth for icon/color identity per section, shared by the
// sidebar and the top header breadcrumb so a section always reads the same
// wherever it appears.
export const navItems: NavItem[] = [
  {
    title: "Overview",
    sectionId: "overview",
    url: "/",
    icon: LayoutDashboard,
    color: "blue",
    description: "Followers, plays, top reel, and engagement at a glance.",
  },
  {
    title: "Reels",
    sectionId: "reels",
    url: "/reels",
    icon: Film,
    color: "orange",
    description: "Every reel, with captions, views, engagement, and a link back to Instagram.",
  },
  {
    title: "Posts",
    sectionId: "posts",
    url: "/posts",
    icon: ImageIcon,
    color: "magenta",
    description: "Your photo and carousel posts — separate from Reels.",
  },
  {
    title: "Insights",
    sectionId: "insights",
    url: "/insights",
    icon: TrendingUp,
    color: "aqua",
    description: "Posting cadence, timing, and trend — deterministic growth signals.",
  },
  {
    title: "Series",
    sectionId: "series",
    url: "/series",
    icon: ListTree,
    color: "yellow",
    description: "Grouped reels, tracked as a story arc over time.",
  },
  {
    title: "Content DNA",
    sectionId: "content-dna",
    url: "/content-dna",
    icon: Dna,
    color: "aqua",
    description: "The recurring hooks, topics, tone, and formats that make your best reels work.",
  },
  {
    title: "Agents",
    sectionId: "agents",
    url: "/agents",
    icon: Bot,
    color: "orange",
    description: "Analytics, Trend, Idea, Planning, and DM agents — live status and activity log.",
  },
  {
    title: "DMs",
    sectionId: "dms",
    url: "/dms",
    icon: MessageCircle,
    color: "magenta",
    description: "Drafted replies for your review — nothing is ever sent automatically.",
  },
  {
    title: "Settings",
    sectionId: "settings",
    url: "/settings",
    icon: Settings,
    color: "blue",
    description: "Connect your Instagram account and manage sync.",
  },
];

// Everything lives on one scrollable home page now. Sidebar/header links
// point here; clicking one either smooth-scrolls (already on "/") or
// navigates home and lands on the anchor.
export function sectionHref(item: Pick<NavItem, "sectionId">): string {
  return `/#${item.sectionId}`;
}

// Active-section resolution has two modes: on the home page, whichever
// section is in view (from scroll-spy) wins; everywhere else (the
// standalone Reels/Posts pages, a reel/post/series detail page), fall back
// to matching the pathname against the section's standalone route.
export function getActiveNavItem(
  pathname: string,
  activeSectionId: string | null
): NavItem | undefined {
  if (pathname === "/") {
    return navItems.find((item) => item.sectionId === activeSectionId) ?? navItems[0];
  }
  return [...navItems].reverse().find((item) => item.url !== "/" && pathname.startsWith(item.url));
}
