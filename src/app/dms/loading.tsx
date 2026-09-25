import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, ListCardSkeleton } from "@/components/skeletons";

export default function DmsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeaderSkeleton />
      <Skeleton className="h-24 w-full rounded-lg" />
      <ListCardSkeleton count={4} />
    </div>
  );
}
