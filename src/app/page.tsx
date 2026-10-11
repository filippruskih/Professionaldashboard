import Link from "next/link";
import { ArrowRight, Bot, CalendarDays, FileText, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconBadge, type IconBadgeColor } from "@/components/icon-badge";
import { AppLogoMark } from "@/components/app-logo-mark";
import { PhoneFrame } from "@/components/marketing/phone-frame";
import {
  SuggestionScreen,
  AnalyticsScreen,
  ScannerScreen,
  TrendsScreen,
  RetentionScreen,
  AgentsScreen,
} from "@/components/marketing/phone-screens";

export const metadata = { title: "CMPND - Instagram analytics and AI content agents" };

const MORE_FEATURES: {
  icon: typeof FileText;
  color: IconBadgeColor;
  title: string;
  description: string;
}[] = [
  {
    icon: FileText,
    color: "yellow",
    title: "Daily reports",
    description:
      "One dated briefing every morning - stat tiles, a follower sparkline, and a plain-English summary of what's new, in-app and by email.",
  },
  {
    icon: CalendarDays,
    color: "magenta",
    title: "Content calendar",
    description:
      "Plan ahead, drop an AI suggestion straight onto a date, and see what's planned next to what you've actually posted.",
  },
  {
    icon: FlaskConical,
    color: "blue",
    title: "Growth experiments",
    description:
      "Retroactive breakdowns by time of day, day of week, and format - no minimum sample size hiding the real numbers from you.",
  },
];

function FeatureRow({
  icon: Icon,
  color,
  eyebrow,
  title,
  description,
  screen,
  reverse = false,
}: {
  icon: typeof Bot;
  color: IconBadgeColor;
  eyebrow: string;
  title: string;
  description: string;
  screen: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
    >
      <div className="flex flex-col items-start gap-4">
        <IconBadge icon={Icon} color={color} />
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{eyebrow}</span>
        <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h3>
        <p className="max-w-md text-base text-muted-foreground text-pretty">{description}</p>
      </div>
      <div className="flex justify-center">
        <PhoneFrame>{screen}</PhoneFrame>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-svh overflow-x-hidden bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
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

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6 lg:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="rounded-full bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] px-3 py-1 text-xs font-medium text-primary">
            For Instagram creators · AI-powered
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Know what&apos;s working.
            <br />
            Automate what&apos;s not.
          </h1>
          <p className="mt-5 text-base text-muted-foreground text-pretty sm:text-lg">
            CMPND tracks every reel and post, tells you what&apos;s actually driving growth, and
            runs a daily AI pipeline that researches trends, writes scripts, and drafts your next
            move.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/login">
                Log in <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">See what it does</a>
            </Button>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-start justify-center gap-6">
          <div className="rotate-2">
            <PhoneFrame>
              <AnalyticsScreen />
            </PhoneFrame>
          </div>
          <div className="-rotate-2 sm:mt-10">
            <PhoneFrame>
              <SuggestionScreen />
            </PhoneFrame>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/40 py-6">
        <p className="mx-auto max-w-3xl px-6 text-center text-lg font-medium text-balance sm:text-xl">
          Keep posting on Instagram.{" "}
          <span className="text-muted-foreground">CMPND handles everything around it.</span>
        </p>
      </section>

      <section id="features" className="mx-auto max-w-6xl divide-y px-6">
        <FeatureRow
          icon={Bot}
          color="orange"
          eyebrow="AI agents, running daily"
          title="A full content pipeline, on autopilot"
          description="Sync, trend research, idea generation, and planning run every morning in sequence - each agent feeding the next - so there's always a ready-to-film hook and script waiting, with nothing sent or posted without your review."
          screen={<AgentsScreen />}
        />
        <FeatureRow
          icon={FlaskConical}
          color="aqua"
          eyebrow="Idea generation"
          title="Fresh ideas from two directions"
          description="One agent mines your own best performers for what to repeat. Another researches what's trending in your niche right now via live web search. Every morning, both land as concrete concepts - not vague inspiration."
          screen={<TrendsScreen />}
          reverse
        />
        <FeatureRow
          icon={Bot}
          color="blue"
          eyebrow="Pre-publish feedback"
          title="Catch it before it's live, not after"
          description="Upload a draft reel and get frame-by-frame AI feedback on your hook, pacing, and caption - plus a recommended rewrite - before you ever hit post."
          screen={<ScannerScreen />}
        />
        <FeatureRow
          icon={FlaskConical}
          color="aqua"
          eyebrow="Retention"
          title="Where viewers actually drop off"
          description="Instagram only exposes one real number - average watch time. Everything here is built from that, honestly labeled as inference where it is one, across your whole account."
          screen={<RetentionScreen />}
          reverse
        />
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">And the rest</h2>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Smaller pieces that round out the daily routine.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {MORE_FEATURES.map((feature) => (
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

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <IconBadge icon={ArrowRight} color="blue" />
            <h2 className="text-xl font-semibold">Ready to see your own numbers?</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Log in to reach your dashboard - followers, performance, and today&apos;s suggestion,
              at a glance.
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
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground sm:flex-row">
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
