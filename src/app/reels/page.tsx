import { Film } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function ReelsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reels</h1>
        <p className="text-sm text-muted-foreground">
          Every reel, with captions, views, engagement, and a link back to Instagram.
        </p>
      </div>
      <EmptyState
        icon={Film}
        title="No reels synced yet"
        description="Connect your account in Settings and run a sync to see your last 10 reels here, with a detail page and feedback-loop comparisons for each one."
      />
    </div>
  );
}
