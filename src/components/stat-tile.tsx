import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatSignedCompactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  delta,
  deltaGoodDirection = "up",
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: number | null;
  deltaGoodDirection?: "up" | "down";
  icon?: LucideIcon;
}) {
  const isGood = delta != null && (deltaGoodDirection === "up" ? delta >= 0 : delta <= 0);

  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
        <p className="text-2xl font-semibold">{value}</p>
        {delta != null && (
          <p className={cn("text-xs", isGood ? "text-delta-good" : "text-destructive")}>
            {formatSignedCompactNumber(delta)} vs previous sync
          </p>
        )}
      </CardContent>
    </Card>
  );
}
