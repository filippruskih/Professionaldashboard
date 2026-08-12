import { Dna } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function ContentDnaPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content DNA</h1>
        <p className="text-sm text-muted-foreground">
          The recurring hooks, topics, tone, and formats that make your best reels work.
        </p>
      </div>
      <EmptyState
        icon={Dna}
        title="Not enough history yet"
        description="Your Content DNA profile is built by the Analytics agent from your top-performing reels over time. It'll appear here once you have synced reel history and run an analytics pass."
      />
    </div>
  );
}
