import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DraftStatusBadge({ status }: { status: string }) {
  if (status === "analyzed") {
    return (
      <Badge variant="secondary" className="text-delta-good gap-1">
        <CheckCircle2 className="size-3" /> Analyzed
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="size-3" /> Failed
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Loader2 className="size-3 animate-spin" /> {status === "processing" ? "Analyzing" : "Uploaded"}
    </Badge>
  );
}
