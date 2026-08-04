import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/format";

type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
};

function pageWindow(page: number, pageCount: number): Array<number> {
  const pages: Array<number> = [];
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const end = Math.min(pageCount, Math.max(page + 2, 5));
  for (let index = Math.max(start, 1); index <= end; index += 1) pages.push(index);
  return pages;
}

/** صفحه‌بندی فهرست محصولات و وبلاگ. */
export function Pagination({ page, pageCount, onChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;

  const buttonClass =
    "inline-flex size-9 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold transition-colors hover:border-brand hover:text-brand disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground";

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)} aria-label="صفحه‌بندی">
      <button type="button" className={buttonClass} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="صفحهٔ قبل">
        <ChevronRight className="size-4" aria-hidden />
      </button>
      {pageWindow(page, pageCount).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          aria-current={item === page ? "page" : undefined}
          className={cn(buttonClass, item === page && "border-brand bg-brand text-primary-foreground hover:text-primary-foreground")}
        >
          {toFaDigits(item)}
        </button>
      ))}
      <button type="button" className={buttonClass} onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="صفحهٔ بعد">
        <ChevronLeft className="size-4" aria-hidden />
      </button>
    </nav>
  );
}
