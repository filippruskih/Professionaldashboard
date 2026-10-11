import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  FileText,
  FlaskConical,
  MessageCircle,
  ScanSearch,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconBadge, type IconBadgeColor } from "@/components/icon-badge";
import { AppLogoMark } from "@/components/app-logo-mark";

export const metadata = { title: "CMPND - Instagram analytics and AI content agents" };

const FEATURES: {
  icon: typeof TrendingUp;
  color: IconBadgeColor;
  title: string;
  description: string;
}[] = [
  {
    icon: TrendingUp,
    color: "blue",
    title: "Performance tracking",
    description:
      "Every reel and post synced automatically, with a 6-baseline feedback loop comparing each one against your own history - your average, your top 10%, same topic, same format, same length.",
  },
  {
    icon: Bot,
    color: "orange",
    title: "AI content agents",
    description:
      "A daily pipeline researches trends, pulls ideas from what's already worked, and writes a ready-to-film hook and script - so there's always something queued up to post next.",
  },
  {
    icon: FlaskConical,
    color: "aqua",
    title: "Growth experiments & retention",
    description:
      "Deterministic breakdowns of what time of day, day of week, and format actually drives engagement - no minimum sample size hiding the real numbers from you.",
  },
  {
    icon: FileText,
    color: "yellow",
    title: "Daily reports",
    description:
      "One dated briefing every morning - stat tiles, a follower sparkline, and a plain-English summary of what happened and what's new, in-app and by email.",
  },
  {
    icon: CalendarDays,
    color: "magenta",
    title: "Content calendar",
    description:
      "Plan ahead, drop an AI suggestion straight onto a date, and see what's planned next to what you've actually posted.",
  },
  {
    icon: ScanSearch,
    color: "blue",
    title: "Pre-publish feedback",
    description:
      "Upload a draft before you post it for AI feedback on the hook, caption, and what to change - before it's live, not after.",
  },
];

function PreviewCard() {
  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-[0_30px_60px_-24px_rgba(10,20,10,0.35)]">
      <div
        className="relative overflow-hidden px-5 py-6 text-white"
        style={{ background: "linear-gradient(120deg, oklch(0.24 0.015 145), oklch(0.145 0.012 145))" }}
      >
        <Sparkles className="pointer-events-none absolute -top-4 right-4 size-20 text-white/10" />
        <p className="relative text-xs font-medium text-white/70">Thursday, 9 October</p>
        <p className="relative mt-1 text-lg font-semibold">Welcome back, @yourhandle</p>
      </div>
      <CardContent className="grid grid-cols-2 gap-3 pt-4">
        <div className="rounded-xl bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Followers</span>
            <IconBadge icon={Users} color="blue" size="sm" className="size-6 [&_svg]:size-3.5" />
          </div>
          <p className="mt-1 text-xl font-semibold tracking-tight">4.1K</p>
          <p className="text-[0.7rem] font-medium text-delta-good">+18 vs previous sync</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Avg engagement</span>
            <IconBadge icon={Zap} color="yellow" size="sm" className="size-6 [&_svg]:size-3.5" />
          </div>
          <p className="mt-1 text-xl font-semibold tracking-tight">6.2%</p>
        </div>
        <div className="col-span-2 rounded-xl bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <IconBadge icon={Sparkles} color="magenta" size="sm" className="size-6 [&_svg]:size-3.5" />
            <span className="text-xs font-medium text-muted-foreground">Today&apos;s suggestion</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-balance">
            &ldquo;Everyone assumes X - here&apos;s what actually happens&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ background: "#B9C6AE" }}
          >
            <AppLogoMark className="size-4.5" />
          </div>
          <span className="text-lg font-semibold">CMPND</span>
        </div>
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:py-20">
        <div className="flex flex-col items-start gap-5">
          <span className="rounded-full bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] px-3 py-1 text-xs font-medium text-primary">
            For Instagram creators · AI-powered
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Know what&apos;s working.
            <br />
            Automate what&apos;s not.
          </h1>
          <p className="max-w-md text-base text-muted-foreground text-pretty">
            CMPND tracks every reel and post, tells you what&apos;s actually driving growth, and
            runs a daily AI pipeline that researches trends, writes scripts, and drafts your next
            move - so you spend less time digging through numbers and more time creating.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/login">
                Log in <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">See what it tracks</a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Built for one account. Your data, your login.</p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <PreviewCard />
        </div>
      </section>

      <section className="border-y bg-muted/40 py-6">
        <p className="mx-auto max-w-3xl px-6 text-center text-lg font-medium text-balance sm:text-xl">
          Keep posting on Instagram.{" "}
          <span className="text-muted-foreground">CMPND handles everything around it.</span>
        </p>
      </section>

      <section id="features" className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Everything in one place</h2>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Six real features, not a checklist - each one feeds the next, so the daily routine is
          mostly automatic.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex flex-col gap-3">
                <IconBadge icon={feature.icon} color={feature.color} />
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <IconBadge icon={MessageCircle} color="blue" />
            <h2 className="text-xl font-semibold">Ready to see your own numbers?</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Log in with the password to reach your dashboard - followers, performance, and
              today&apos;s suggestion, at a glance.
            </p>
            <Button size="lg" asChild>
              <Link href="/login">
                Log in <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground sm:flex-row">
          <span>CMPND</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
