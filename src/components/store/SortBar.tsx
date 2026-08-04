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

/** نوار مرتب‌سازی و شمارش نتایج. */
export function SortBar({
  sort,
  total,
  onChange,
  className,
}: {
  sort: SortKeyUi;
  total: number;
  onChange: (sort: SortKeyUi) => void;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3", className)}>
      <span className="text-xs font-bold text-muted-foreground">مرتب‌سازی:</span>
      <div className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto">
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={cn(
              "whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
              sort === option.key ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className="ms-auto text-xs text-muted-foreground">{toFaDigits(total)} کالا</span>
    </div>
  );
}
