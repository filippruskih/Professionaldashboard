import { BackLinkSkeleton, DetailHeroSkeleton, StatTilesSkeleton, ChartSkeleton } from "@/components/skeletons";

export default function ReelDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <BackLinkSkeleton />
      <DetailHeroSkeleton />
      <StatTilesSkeleton count={5} />
      <ChartSkeleton />
    </div>
  );
}
