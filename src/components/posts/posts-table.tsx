import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCompactNumber, formatDate, formatPercent } from "@/lib/format";
import { mediaTypeLabel, type PostWithLatestInsight } from "@/lib/posts";

export function PostsTable({ posts }: { posts: PostWithLatestInsight[] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Post</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead className="text-right">Plays</TableHead>
            <TableHead className="text-right">Likes</TableHead>
            <TableHead className="text-right">Comments</TableHead>
            <TableHead className="text-right">Saves</TableHead>
            <TableHead className="text-right">Engagement</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => {
            const insight = post.latestInsight;
            return (
              <TableRow key={post.id}>
                <TableCell className="whitespace-normal">
                  <Link href={`/posts/${post.id}`} className="flex items-center gap-3">
                    {post.thumbnailUrl ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                        <Image
                          src={post.thumbnailUrl}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded bg-muted" />
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="line-clamp-2 max-w-xs text-sm">
                        {post.caption ?? "No caption"}
                      </span>
                      <Badge variant="outline" className="w-fit">
                        {mediaTypeLabel(post.mediaType)}
                      </Badge>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(post.postedAt)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {insight?.views != null ? formatCompactNumber(insight.views) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {insight?.likes != null ? formatCompactNumber(insight.likes) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {insight?.comments != null ? formatCompactNumber(insight.comments) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {insight?.saved != null ? formatCompactNumber(insight.saved) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {insight?.engagementRate != null ? formatPercent(insight.engagementRate) : "—"}
                </TableCell>
                <TableCell>
                  <Link
                    href={post.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
