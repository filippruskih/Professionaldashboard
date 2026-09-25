import { PageHeaderSkeleton, ContentTabsSkeleton, CardGridSkeleton } from "@/components/skeletons";

export default function SeriesLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeaderSkeleton />
      <ContentTabsSkeleton />
      <CardGridSkeleton count={4} columns="md:grid-cols-2" aspect="h-24" />
    </div>
  );
}
