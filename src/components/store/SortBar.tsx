import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/format";

export type SortKeyUi = "newest" | "cheapest" | "expensive" | "popular" | "rating" | "discount";

const OPTIONS: Array<{ key: SortKeyUi; label: string }> = [
  { key: "newest", label: "جدیدترین" },
  { key: "popular", label: "پرفروش‌ترین" },
  { key: "cheapest", label: "ارزان‌ترین" },
  { key: "expensive", label: "گران‌ترین" },
  { key: "rating", label: "بهترین امتیاز" },
  { key: "discount", label: "بیشترین تخفیف" },
];

export function SortBar({
  sort,
  total,
  onChange,
  className,
  onOpenFilters,
  activeFiltersCount = 0,
}: {
  sort: SortKeyUi;
  total: number;
  onChange: (sort: SortKeyUi) => void;
  className?: string;
  /** اگر داده شود، دکمهٔ «فیلترها» فقط در موبایل نمایش داده می‌شود. */
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
}) {
  return (
    <div
      className={cn(
        "mb-gutter flex flex-wrap items-center justify-between gap-3 rounded-lg border border-surface-container-high bg-surface-container-lowest p-4 shadow-sm",
        className,
      )}
    >
      {onOpenFilters ? (
        <button
          type="button"
          onClick={onOpenFilters}
          className="relative inline-flex shrink-0 items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 text-[13px] font-bold text-on-surface shadow-sm transition-colors hover:border-primary/50 hover:text-primary md:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          فیلترها
          {activeFiltersCount > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
              {toFaDigits(activeFiltersCount)}
            </span>
          ) : null}
        </button>
      ) : null}

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="ml-1 hidden shrink-0 font-label-md text-label-md text-on-surface-variant sm:inline">
          مرتب‌سازی:
        </span>
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-all",
              sort === option.key
                ? "bg-primary-fixed text-on-primary-fixed"
                : "text-on-surface-variant hover:bg-surface-container-low",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className="shrink-0 text-[13px] font-semibold text-on-surface-variant">
        نمایش {toFaDigits(total)} کالا
      </span>
    </div>
  );
}
