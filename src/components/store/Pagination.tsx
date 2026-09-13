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

/** صفحه‌بندی pill-style مطابق مرجع: ردیف دایره‌ای داخل ظرف گرد با سایهٔ نرم. */
export function Pagination({ page, pageCount, onChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;

  const buttonClass =
    "inline-flex size-10 items-center justify-center rounded-full text-sm font-bold transition-all hover:bg-primary-fixed active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <nav
      className={cn("flex items-center justify-center", className)}
      aria-label="صفحه‌بندی"
    >
      <div className="flex items-center gap-1 rounded-full border border-surface-container-high bg-surface-container-lowest p-1.5 shadow-sm">
        <button
          type="button"
          className={buttonClass}
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="صفحهٔ قبل"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
        {pageWindow(page, pageCount).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              buttonClass,
              item === page && "bg-primary text-on-primary shadow-md shadow-primary/25 hover:bg-primary",
            )}
          >
            {toFaDigits(item)}
          </button>
        ))}
        <button
          type="button"
          className={buttonClass}
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="صفحهٔ بعد"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
