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
    <div className={cn("mb-8 flex flex-wrap items-center gap-4 lg:gap-8 border-b border-border pb-2", className)}>
      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">مرتب‌سازی:</span>
      <div className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto">
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={cn(
              "whitespace-nowrap text-[9px] font-bold uppercase tracking-widest transition-colors",
              sort === option.key ? "text-gray-900 border-b-2 border-gray-900 pb-4 -mb-[18px]" : "text-gray-400 hover:text-gray-900 pb-4 -mb-[18px]",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <span className="ms-auto text-[9px] font-bold uppercase tracking-widest text-gray-400">{toFaDigits(total)} کالا</span>
    </div>
  );
}
