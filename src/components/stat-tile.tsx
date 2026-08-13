import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatSignedCompactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { IconBadge, type IconBadgeColor } from "@/components/icon-badge";

export function StatTile({
  label,
  value,
  delta,
  deltaGoodDirection = "up",
  icon: Icon,
  color = "blue",
}: {
  label: string;
  value: string;
  delta?: number | null;
  deltaGoodDirection?: "up" | "down";
  icon?: LucideIcon;
  color?: IconBadgeColor;
}) {
  const isGood = delta != null && (deltaGoodDirection === "up" ? delta >= 0 : delta <= 0);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon && <IconBadge icon={Icon} color={color} size="sm" />}
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
