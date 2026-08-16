import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import type { IconBadgeColor } from "@/components/icon-badge";

// One section of the single scrolling home page. scroll-mt offsets the
// sticky header so an anchor-scroll (or smooth-scroll from the sidebar)
// doesn't land with the title hidden underneath it. The top border + extra
// padding is the "clear separation" cue between sections while scrolling —
// every section but the first gets a firm divider and breathing room
// before its header.
export function SectionShell({
  id,
  icon,
  color,
  title,
  description,
  action,
  first = false,
  children,
}: {
  id: string;
  icon: LucideIcon;
  color?: IconBadgeColor;
  title: string;
  description?: string;
  action?: ReactNode;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("flex scroll-mt-24 flex-col gap-4", !first && "mt-4 border-t pt-10")}
    >
      <PageHeader icon={icon} color={color} title={title} description={description} action={action} />
      {children}
    </section>
  );
}
