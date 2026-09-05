import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/format";
import { ChevronDown } from "lucide-react";

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
}: {
  sort: SortKeyUi;
  total: number;
  onChange: (sort: SortKeyUi) => void;
  className?: string;
}) {
  const activeLabel = OPTIONS.find(o => o.key === sort)?.label;

  return (
    <div className={cn("mb-8 flex min-w-0 flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex min-w-0 items-center gap-6 overflow-x-auto hide-scrollbar">
        <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:inline">مرتب‌سازی براساس:</span>
        <div className="flex shrink-0 items-center gap-6">
          {OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              className={cn(
                "whitespace-nowrap text-[12px] font-bold transition-all relative pb-2 -mb-2",
                sort === option.key 
                  ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
                  : "text-muted-foreground hover:text-gray-900"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">نمایش {toFaDigits(total)} کالا</span>
      </div>
    </div>
  );
}