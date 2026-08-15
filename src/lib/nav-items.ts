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
    url: "/",
    icon: LayoutDashboard,
    color: "blue",
    description: "Followers, plays, top reel, and engagement at a glance.",
  },
  {
    title: "Reels",
    url: "/reels",
    icon: Film,
    color: "orange",
    description: "Every reel, with captions, views, engagement, and a link back to Instagram.",
  },
  {
    title: "Posts",
    url: "/posts",
    icon: ImageIcon,
    color: "magenta",
    description: "Your photo and carousel posts — separate from Reels.",
  },
  {
    title: "Insights",
    url: "/insights",
    icon: TrendingUp,
    color: "aqua",
    description: "Posting cadence, timing, and trend — deterministic growth signals.",
  },
  {
    title: "Series",
    url: "/series",
    icon: ListTree,
    color: "yellow",
    description: "Grouped reels, tracked as a story arc over time.",
  },
  {
    title: "Content DNA",
    url: "/content-dna",
    icon: Dna,
    color: "aqua",
    description: "The recurring hooks, topics, tone, and formats that make your best reels work.",
  },
  {
    title: "Agents",
    url: "/agents",
    icon: Bot,
    color: "orange",
    description: "Analytics, Trend, Idea, Planning, and DM agents — live status and activity log.",
  },
  {
    title: "DMs",
    url: "/dms",
    icon: MessageCircle,
    color: "magenta",
    description: "Drafted replies for your review — nothing is ever sent automatically.",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    color: "blue",
    description: "Connect your Instagram account and manage sync.",
  },
];

export function navItemForPath(pathname: string): NavItem | undefined {
  if (pathname === "/") return navItems[0];
  return [...navItems].reverse().find((item) => item.url !== "/" && pathname.startsWith(item.url));
}
