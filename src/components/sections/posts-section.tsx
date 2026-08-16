import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SectionShell } from "@/components/section-shell";
import { PostsGrid } from "@/components/posts/posts-grid";
import { Button } from "@/components/ui/button";
import { getPostsWithLatestInsights } from "@/lib/posts";

const RECENT_LIMIT = 9;

export async function PostsSection() {
  const allPosts = await getPostsWithLatestInsights();
  const posts = allPosts.slice(0, RECENT_LIMIT);

  return (
    <SectionShell
      id="posts"
      icon={ImageIcon}
      color="magenta"
      title="Posts"
      description="Your photo and carousel posts — separate from Reels."
      action={
        allPosts.length > 0 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href="/posts">View all posts</Link>
          </Button>
        ) : undefined
      }
    >
      {posts.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          color="magenta"
          title="No posts synced yet"
          description="Connect your account in Settings and run a sync to see your feed posts here."
        />
      ) : (
        <PostsGrid posts={posts} />
      )}
    </SectionShell>
  );
}
