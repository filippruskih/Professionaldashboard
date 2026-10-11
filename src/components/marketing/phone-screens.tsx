import {
  Activity,
  Bot,
  CalendarClock,
  Check,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  ScanSearch,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/icon-badge";

// Every screen below is illustrative sample content for the public landing
// page, not real data - this page has no session and nothing here is
// fetched from the database.

export function SuggestionScreen() {
  return (
    <div className="flex h-full flex-col">
      <div
        className="px-4 pt-7 pb-5 text-white"
        style={{ background: "linear-gradient(120deg, oklch(0.24 0.015 145), oklch(0.145 0.012 145))" }}
      >
        <p className="text-[0.65rem] text-white/70">Thursday, 9 October</p>
        <p className="mt-0.5 text-base font-semibold">Welcome back, @yourhandle</p>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted/60 p-2.5">
            <p className="text-[0.65rem] text-muted-foreground">Followers</p>
            <p className="text-base font-semibold tracking-tight">4.1K</p>
            <p className="text-[0.6rem] font-medium text-delta-good">+18 today</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-2.5">
            <p className="text-[0.65rem] text-muted-foreground">Avg engagement</p>
            <p className="text-base font-semibold tracking-tight">6.2%</p>
          </div>
        </div>
        <div className="flex-1 rounded-xl bg-muted/60 p-3">
          <div className="flex items-center gap-1.5">
            <IconBadge icon={Sparkles} color="magenta" size="sm" className="size-6 [&_svg]:size-3.5" />
            <span className="text-[0.65rem] font-medium text-muted-foreground">Today&apos;s suggestion</span>
            <Badge variant="outline" className="ml-auto h-4 px-1.5 text-[0.6rem] font-normal">
              Reel
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-snug font-semibold text-balance">
            &ldquo;Everyone assumes this takes an hour - here&apos;s the 90-second version&rdquo;
          </p>
          <div className="mt-2 rounded-lg bg-background/70 p-2">
            <p className="text-[0.6rem] font-semibold tracking-wide text-muted-foreground uppercase">Script</p>
            <p className="mt-1 line-clamp-3 text-[0.7rem] leading-relaxed text-muted-foreground">
              Open on the finished result, then cut back to &quot;everyone thinks this takes an
              hour.&quot; Show the real time on screen...
            </p>
          </div>
          <div className="mt-2 flex gap-1.5">
            <span className="flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-[0.65rem] font-semibold text-primary-foreground">
              <Check className="size-3" /> Used
            </span>
            <span className="rounded-lg border px-2 py-1 text-[0.65rem] font-medium">Schedule</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsScreen() {
  const metrics = [
    { label: "Plays", value: "28.4K", color: "var(--chart-1)" },
    { label: "Reach", value: "19.1K", color: "var(--chart-2)" },
    { label: "Likes", value: "1.2K", color: "var(--chart-3)" },
    { label: "Comments", value: "84", color: "var(--chart-4)" },
    { label: "Saves", value: "310", color: "var(--chart-5)" },
    { label: "Avg watch", value: "9.2s", color: "var(--chart-1)" },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div>
        <p className="text-[0.65rem] text-muted-foreground">3 October</p>
        <p className="text-sm leading-snug font-medium">
          &ldquo;Stop doing X - here&apos;s why it backfires&rdquo;
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="relative overflow-hidden rounded-xl bg-muted/60 p-2.5">
            <div
              className="absolute inset-x-0 top-0 h-0.5"
              style={{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)` }}
            />
            <p className="text-[0.6rem] text-muted-foreground">{m.label}</p>
            <p className="text-sm font-semibold tracking-tight">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-muted/60 p-3">
        <div className="flex items-center gap-1.5">
          <IconBadge icon={TrendingUp} color="aqua" size="sm" className="size-6 [&_svg]:size-3.5" />
          <span className="text-[0.65rem] font-medium text-muted-foreground">vs. your average</span>
        </div>
        <p className="mt-1.5 text-xs text-delta-good">+184% plays · +62% engagement</p>
        <p className="mt-0.5 text-[0.65rem] text-muted-foreground">Same format, same length - your best this month.</p>
      </div>
    </div>
  );
}

export function ScannerScreen() {
  const breakdown = [
    { area: "Hook", note: "First line gives away the twist - hold it back 2 more seconds.", color: "var(--chart-1)" },
    { area: "Pacing", note: "Middle section drags - cut the setup shot entirely.", color: "var(--chart-2)" },
    { area: "Caption", note: "Add a direct question to invite replies, not just views.", color: "var(--chart-3)" },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center gap-1.5">
        <IconBadge icon={ScanSearch} color="orange" size="sm" className="size-6 [&_svg]:size-3.5" />
        <span className="text-xs font-semibold">Draft feedback</span>
        <Badge variant="secondary" className="ml-auto h-4 px-1.5 text-[0.6rem] font-normal">
          Analyzed
        </Badge>
      </div>
      <div className="aspect-9/16 w-full rounded-xl bg-neutral-800" />
      <div className="rounded-xl bg-muted/60 p-2.5">
        <p className="text-[0.6rem] font-semibold tracking-wide text-muted-foreground uppercase">Recommended hook</p>
        <p className="mt-1 text-xs leading-snug font-semibold">
          &ldquo;I filmed this 4 times before it worked - here&apos;s take one&rdquo;
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {breakdown.map((b) => (
          <div
            key={b.area}
            className="rounded-r-lg border-l-[3px] bg-muted/40 py-1.5 pr-2.5 pl-2.5"
            style={{ borderColor: b.color }}
          >
            <p className="text-[0.65rem] font-semibold">{b.area}</p>
            <p className="text-[0.65rem] leading-snug text-muted-foreground">{b.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendsScreen() {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center gap-1.5">
        <IconBadge icon={Lightbulb} color="aqua" size="sm" className="size-6 [&_svg]:size-3.5" />
        <span className="text-xs font-semibold">Where to point your next reel</span>
      </div>
      <div className="rounded-xl bg-muted/60 p-2.5">
        <p className="flex items-center gap-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          From your niche
        </p>
        <p className="mt-1.5 text-xs leading-snug font-medium">
          The &ldquo;cost comparison&rdquo; format, applied to a new angle
        </p>
        <p className="mt-1 text-[0.65rem] leading-snug text-muted-foreground">
          Your last cost-comparison reel beat account average by 3x - the same structure hasn&apos;t
          been used on this topic yet.
        </p>
      </div>
      <div className="rounded-xl bg-muted/60 p-2.5">
        <p className="flex items-center gap-1 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Trending, new territory
        </p>
        <p className="mt-1.5 text-xs leading-snug font-medium">
          The &ldquo;stop doing X&rdquo; myth-busting format
        </p>
        <p className="mt-1 text-[0.65rem] leading-snug text-muted-foreground">
          Gaining traction in your niche this week - you haven&apos;t touched this angle yet.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
        <RefreshCw className="size-3" /> Researched fresh via web search, daily
      </div>
    </div>
  );
}

export function RetentionScreen() {
  const rows = [
    { label: "Ireland vs. Australia, part 3", pct: "71%" },
    { label: "The real cost of moving abroad", pct: "64%" },
    { label: "What nobody tells you about...", pct: "58%" },
  ];
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center gap-1.5">
        <IconBadge icon={Activity} color="aqua" size="sm" className="size-6 [&_svg]:size-3.5" />
        <span className="text-xs font-semibold">Retention</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/60 p-2.5">
          <p className="text-[0.6rem] text-muted-foreground">Average retention</p>
          <p className="text-lg font-semibold tracking-tight">54%</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-2.5">
          <p className="text-[0.6rem] text-muted-foreground">Retention vs. reach</p>
          <p className="text-lg font-semibold tracking-tight">2.1x</p>
        </div>
      </div>
      <div className="rounded-xl bg-muted/60 p-2.5">
        <p className="mb-1 flex items-center gap-1 text-[0.65rem] font-semibold text-muted-foreground">
          <Trophy className="size-3 text-[var(--chart-2)]" /> Best retained
        </p>
        <div className="flex flex-col gap-1">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-2 text-[0.68rem]">
              <span className="line-clamp-1 flex-1 text-muted-foreground">{r.label}</span>
              <span className="font-semibold tabular-nums">{r.pct}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[0.62rem] text-muted-foreground">
        Built from the one real retention number Instagram exposes - never guessed.
      </p>
    </div>
  );
}

const AGENTS = [
  { icon: RefreshCw, color: "blue" as const, name: "Sync", desc: "Pulls your latest reels, posts, and follower count." },
  { icon: TrendingUp, color: "orange" as const, name: "Trend scanner", desc: "Researches current trends in your niche." },
  { icon: Lightbulb, color: "aqua" as const, name: "Idea creation", desc: "Generates ideas from trends and your top performers." },
  { icon: CalendarClock, color: "yellow" as const, name: "Planning", desc: "Turns the best idea into a hook and script." },
  { icon: MessageCircle, color: "magenta" as const, name: "DM manager", desc: "Drafts replies for your review - never auto-sends." },
];

export function AgentsScreen() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <IconBadge icon={Bot} color="orange" size="sm" className="size-6 [&_svg]:size-3.5" />
        <span className="text-xs font-semibold">Agents</span>
      </div>
      {AGENTS.map((a) => (
        <div key={a.name} className="flex items-center gap-2 rounded-xl bg-muted/60 p-2">
          <IconBadge icon={a.icon} color={a.color} size="sm" className="size-7 [&_svg]:size-3.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium">{a.name}</p>
            <p className="line-clamp-1 text-[0.62rem] text-muted-foreground">{a.desc}</p>
          </div>
        </div>
      ))}
      <div className="mt-auto flex items-center gap-1.5 rounded-xl bg-primary/10 p-2 text-[0.65rem] font-medium text-primary">
        <Sparkles className="size-3.5" /> Runs automatically, every day
      </div>
    </div>
  );
}
