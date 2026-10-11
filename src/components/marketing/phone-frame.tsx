import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// A lightweight phone bezel for the landing page's feature mockups - pure
// CSS, no image asset. Fixed aspect ratio so screen content can be laid
// out at a known width regardless of viewport.
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative w-72 shrink-0 rounded-[2.75rem] border-[6px] border-neutral-900 bg-neutral-900 p-1.5 shadow-[0_30px_60px_-20px_rgba(10,20,10,0.45)]",
        className
      )}
    >
      <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
      <div className="h-[36rem] overflow-hidden rounded-[2.1rem] bg-background">{children}</div>
    </div>
  );
}
