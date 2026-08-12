import { ListTree } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function SeriesPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Series</h1>
        <p className="text-sm text-muted-foreground">
          Group reels into a series, like &quot;Account Growth Journey&quot;, and track its stats from the start.
        </p>
      </div>
      <EmptyState
        icon={ListTree}
        title="No series yet"
        description="Once you have reels synced, you'll be able to tag a group of them into a series and see how its stats trend over time."
      />
    </div>
  );
}
