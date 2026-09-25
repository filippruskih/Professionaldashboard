import { PageHeaderSkeleton, ContentTabsSkeleton, CardGridSkeleton } from "@/components/skeletons";

export default function PostsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeaderSkeleton />
      <ContentTabsSkeleton />
      <CardGridSkeleton count={9} aspect="aspect-square" />
    </div>
  );
}
