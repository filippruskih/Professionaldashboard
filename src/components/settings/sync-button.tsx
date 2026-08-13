"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SyncButton() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "syncing" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setStatus("syncing");
    setMessage(null);
    try {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setStatus("idle");
      setMessage(
        `Synced @${data.username}: ${data.reelsSynced} reels, ${data.postsSynced} posts, ${data.followerCount} followers.`
      );
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Sync failed");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleSync} disabled={status === "syncing"} className="w-fit">
        <RefreshCw className={status === "syncing" ? "animate-spin" : ""} />
        {status === "syncing" ? "Syncing…" : "Sync now"}
      </Button>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
