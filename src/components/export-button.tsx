"use client";

import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Copies a full Markdown summary of the account's analytics to the
// clipboard - meant to be pasted into a separate chat (e.g. Claude.ai)
// for review, since that chat has no way to log into this dashboard
// itself. See src/lib/export.ts for what's included.
export function ExportButton() {
  const [state, setState] = useState<"idle" | "loading" | "copied" | "error">("idle");

  async function handleExport() {
    setState("loading");
    try {
      const res = await fetch("/api/export", { cache: "no-store" });
      if (!res.ok) throw new Error("Export failed");
      const { markdown } = await res.json();
      await navigator.clipboard.writeText(markdown);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleExport} disabled={state === "loading"}>
      {state === "loading" && <Loader2 className="animate-spin" />}
      {state === "copied" && <Check />}
      {(state === "idle" || state === "error") && <Copy />}
      {state === "loading" && "Preparing…"}
      {state === "copied" && "Copied"}
      {state === "error" && "Failed - try again"}
      {state === "idle" && "Export for AI review"}
    </Button>
  );
}
