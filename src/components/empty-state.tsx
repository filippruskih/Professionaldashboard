import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IconBadge, type IconBadgeColor } from "@/components/icon-badge";

export function EmptyState({
  icon: Icon,
  title,
  description,
  color = "blue",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: IconBadgeColor;
}) {
  return (
    <Card className="border-dashed shadow-none ring-0">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <IconBadge icon={Icon} color={color} size="md" className="size-14 rounded-2xl [&_svg]:size-6" />
        <p className="font-medium">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>
      </CardContent>
    </Card>
  );
}
