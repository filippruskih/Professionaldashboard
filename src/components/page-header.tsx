import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { IconBadge, type IconBadgeColor } from "@/components/icon-badge";

export function PageHeader({
  icon,
  color = "blue",
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  color?: IconBadgeColor;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <IconBadge icon={icon} color={color} className="mt-0.5" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground text-pretty">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
