import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page <= 1 ? (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft />
            Previous
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={`${basePath}?page=${page - 1}`}>
              <ChevronLeft />
              Previous
            </Link>
          </Button>
        )}
        {page >= totalPages ? (
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight />
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={`${basePath}?page=${page + 1}`}>
              Next
              <ChevronRight />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
