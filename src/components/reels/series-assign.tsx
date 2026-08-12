"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE_VALUE = "__none__";

export function SeriesAssign({
  reelId,
  currentSeriesId,
  seriesOptions,
}: {
  reelId: string;
  currentSeriesId: string | null;
  seriesOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(value: string) {
    setPending(true);
    try {
      await fetch(`/api/reels/${reelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId: value === NONE_VALUE ? null : value }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Select value={currentSeriesId ?? NONE_VALUE} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger size="sm" className="w-fit">
        <SelectValue placeholder="No series" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>No series</SelectItem>
        {seriesOptions.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
