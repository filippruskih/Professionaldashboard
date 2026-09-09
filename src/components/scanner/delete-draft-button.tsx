"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteDraftButton({
  id,
  redirectTo,
  className,
}: {
  id: string;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this draft scan? This can't be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/drafts/${id}`, { method: "DELETE" });
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete draft"
    >
      {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
    </Button>
  );
}
