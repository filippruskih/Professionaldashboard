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
import { formatCompactNumber, formatDate, formatPercent, formatSecondsFromMs } from "@/lib/format";
import type { ReelWithLatestInsight } from "@/lib/stats";

export function ReelsTable({ reels }: { reels: ReelWithLatestInsight[] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reel</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead className="text-right">Plays</TableHead>
            <TableHead className="text-right">Likes</TableHead>
            <TableHead className="text-right">Comments</TableHead>
            <TableHead className="text-right">Saves</TableHead>
            <TableHead className="text-right">Engagement</TableHead>
            <TableHead className="text-right">Avg watch</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {reels.map((reel) => {
            const insight = reel.latestInsight;
            return (
              <TableRow key={reel.id}>
                <TableCell className="whitespace-normal">
                  <Link href={`/reels/${reel.id}`} className="flex items-center gap-3">
                    {reel.thumbnailUrl ? (
                      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                        <Image
                          src={reel.thumbnailUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-10 shrink-0 rounded bg-muted" />
                    )}
                    <span className="line-clamp-2 max-w-xs text-sm">
                      {reel.caption ?? "No caption"}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(reel.postedAt)}
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
                <TableCell className="text-right tabular-nums">
                  {insight?.avgWatchTimeMs != null
                    ? formatSecondsFromMs(insight.avgWatchTimeMs)
                    : "—"}
                </TableCell>
                <TableCell>
                  <Link
                    href={reel.permalink}
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
