import { Suspense } from "react";
import { SectionSkeleton } from "@/components/section-skeleton";
import { OverviewSection } from "@/components/sections/overview-section";
import { ReelsSection } from "@/components/sections/reels-section";
import { PostsSection } from "@/components/sections/posts-section";
import { InsightsSection } from "@/components/sections/insights-section";
import { SeriesSection } from "@/components/sections/series-section";
import { ContentDnaSection } from "@/components/sections/content-dna-section";
import { AgentsSection } from "@/components/sections/agents-section";
import { DmsSection } from "@/components/sections/dms-section";
import { SettingsSection } from "@/components/sections/settings-section";

export const dynamic = "force-dynamic";

// The whole dashboard as one continuously-scrolling page — sections used to
// be separate routes you clicked between; now the sidebar smooth-scrolls to
// an anchor within this page instead. Each section streams in
// independently via its own Suspense boundary so a slow one (e.g. Agents,
// which does a few queries) doesn't block the others from appearing.
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { connected, error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<SectionSkeleton />}>
        <OverviewSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <ReelsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <PostsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <InsightsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <SeriesSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <ContentDnaSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <AgentsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <DmsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <SettingsSection connected={connected} error={error} />
      </Suspense>
    </div>
  );
}
