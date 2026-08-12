"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

interface Suggestion {
  id: string;
  date: string;
  hook: string;
  script: string;
}

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function setStatus(status: "used" | "dismissed") {
    setPending(true);
    try {
      await fetch(`/api/suggestions/${suggestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-muted-foreground" />
          Today&apos;s suggestion
        </CardTitle>
        <p className="text-xs text-muted-foreground">{formatDate(suggestion.date)}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Hook</p>
          <p className="text-sm font-medium">{suggestion.hook}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Script</p>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{suggestion.script}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={pending} onClick={() => setStatus("used")}>
            <Check /> Mark as used
          </Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => setStatus("dismissed")}>
            <X /> Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
