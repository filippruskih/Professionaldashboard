import { Image as ImageIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PostsTable } from "@/components/posts/posts-table";
import { PaginationControls } from "@/components/reels/pagination-controls";
import { getPostsPage } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const { posts, totalCount, pageSize } = await getPostsPage(page);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <p className="text-sm text-muted-foreground">
          Your photo and carousel posts — separate from Reels.
        </p>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No posts synced yet"
          description="Connect your account in Settings and run a sync to see your feed posts here."
        />
      ) : (
        <>
          <PostsTable posts={posts} />
          <PaginationControls page={page} totalPages={totalPages} basePath="/posts" />
        </>
      )}
    </div>
  );
}
