import { Image as ImageIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PostsGrid } from "@/components/posts/posts-grid";
import { PaginationControls } from "@/components/reels/pagination-controls";
import { ContentTabs } from "@/components/content-tabs";
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
      <PageHeader
        icon={ImageIcon}
        color="magenta"
        title="Posts"
        description="Your photo and carousel posts — separate from Reels."
      />

      <ContentTabs active="posts" />

      {posts.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          color="magenta"
          title="No posts synced yet"
          description="Connect your account in Settings and run a sync to see your feed posts here."
        />
      ) : (
        <>
          <PostsGrid posts={posts} />
          <PaginationControls page={page} totalPages={totalPages} basePath="/posts" />
        </>
      )}
    </div>
  );
}
