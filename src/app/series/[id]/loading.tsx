import { Skeleton } from "@/components/ui/skeleton";
import { BackLinkSkeleton, ChartSkeleton, CardGridSkeleton } from "@/components/skeletons";

export default function SeriesDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <BackLinkSkeleton />
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <div className="flex flex-col gap-2 pt-0.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <ChartSkeleton />
      <CardGridSkeleton count={3} />
    </div>
  );
}
