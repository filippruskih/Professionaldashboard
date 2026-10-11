import { db } from "@/lib/db";
import type { Post, PostInsightSnapshot } from "@/generated/prisma/client";

export type PostWithLatestInsight = Post & { latestInsight: PostInsightSnapshot | null };

// Mirrors getReelsWithLatestInsights in lib/stats.ts — same historical-
// snapshot-per-item convention, just for Feed posts instead of Reels.
export async function getPostsWithLatestInsights(userId: string): Promise<PostWithLatestInsight[]> {
  const posts = await db.post.findMany({
    where: { userId },
    orderBy: { postedAt: "desc" },
    include: { insights: { orderBy: { capturedAt: "desc" }, take: 1 } },
  });

  return posts.map((post) => ({
    ...post,
    latestInsight: post.insights[0] ?? null,
  }));
}

const POSTS_PAGE_SIZE = 9; // 3x3 grid per page

export async function getPostsPage(userId: string, page: number): Promise<{
  posts: PostWithLatestInsight[];
  totalCount: number;
  pageSize: number;
}> {
  const totalCount = await db.post.count({ where: { userId } });
  const posts = await db.post.findMany({
    where: { userId },
    orderBy: { postedAt: "desc" },
    skip: (page - 1) * POSTS_PAGE_SIZE,
    take: POSTS_PAGE_SIZE,
    include: { insights: { orderBy: { capturedAt: "desc" }, take: 1 } },
  });

  return {
    posts: posts.map((post) => ({ ...post, latestInsight: post.insights[0] ?? null })),
    totalCount,
    pageSize: POSTS_PAGE_SIZE,
  };
}

const MEDIA_TYPE_LABELS: Record<string, string> = {
  IMAGE: "Photo",
  CAROUSEL_ALBUM: "Carousel",
  VIDEO: "Video",
};

export function mediaTypeLabel(mediaType: string): string {
  return MEDIA_TYPE_LABELS[mediaType] ?? mediaType;
}

export async function getPostDetail(userId: string, id: string) {
  const post = await db.post.findFirst({
    where: { id, userId },
    include: { insights: { orderBy: { capturedAt: "desc" } } },
  });
  if (!post) return null;

  return {
    ...post,
    latestInsight: post.insights[0] ?? null,
  };
}
