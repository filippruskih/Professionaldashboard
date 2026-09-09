"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftStatusBadge } from "@/components/scanner/status-badge";
import { DeleteDraftButton } from "@/components/scanner/delete-draft-button";

interface DraftAnalysis {
  breakdown: { area: string; suggestion: string }[];
  hook: string;
  caption: string;
}

interface DraftData {
  id: string;
  filename: string;
  status: string;
  error: string | null;
  analysis: DraftAnalysis | null;
}

const POLL_INTERVAL_MS = 2500;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function DraftDetail({ initial }: { initial: DraftData }) {
  const [draft, setDraft] = useState(initial);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPending = draft.status === "uploaded" || draft.status === "processing";

  useEffect(() => {
    async function refresh() {
      const res = await fetch(`/api/drafts/${draft.id}`, { cache: "no-store" });
      if (res.ok) setDraft(await res.json());
    }
    if (isPending && !pollRef.current) {
      pollRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    }
    if (!isPending && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isPending, draft.id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">{draft.filename}</h1>
          <div className="mt-1">
            <DraftStatusBadge status={draft.status} />
          </div>
        </div>
        <DeleteDraftButton id={draft.id} redirectTo="/scanner" />
      </div>

      <video
        src={`/api/drafts/${draft.id}/video`}
        controls
        playsInline
        className="max-h-[70vh] w-full rounded-lg bg-black"
      />

      {isPending && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Analyzing your draft — extracting frames and comparing against your trend research and
            Content DNA. This can take a minute.
          </CardContent>
        </Card>
      )}

      {draft.status === "failed" && (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            Analysis failed: {draft.error || "Unknown error"}
          </CardContent>
        </Card>
      )}

      {draft.status === "analyzed" && draft.analysis && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recommended hook</CardTitle>
              <CopyButton text={draft.analysis.hook} />
            </CardHeader>
            <CardContent>
              <p className="text-sm">{draft.analysis.hook}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Caption</CardTitle>
              <CopyButton text={draft.analysis.caption} />
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{draft.analysis.caption}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What to change or add</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {draft.analysis.breakdown.map((item, i) => (
                <div key={i} className="flex flex-col gap-1 border-l-2 pl-3">
                  <Badge variant="outline" className="w-fit">
                    {item.area}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
