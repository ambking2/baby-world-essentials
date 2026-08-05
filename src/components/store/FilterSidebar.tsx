import { Link } from "@tanstack/react-router";
import { Check, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatToman, toFaDigits } from "@/lib/format";
import type { Category } from "@/server/repo/catalog";

export type FilterState = {
  minPrice?: number;
  maxPrice?: number;
  sizes: Array<string>;
  colors: Array<string>;
  onlyAvailable: boolean;
  onlyDiscounted: boolean;
};

type FilterSidebarProps = {
  state: FilterState;
  onChange: (next: FilterState) => void;
  priceBounds: { min: number; max: number };
  availableSizes: Array<string>;
  availableColors: Array<{ color: string; hex: string | null }>;
  categories?: Array<Category>;
  activeSlug?: string;
  className?: string;
};

/** ستون فیلتر فهرست محصولات: قیمت، سایز، رنگ و وضعیت موجودی. */
export function FilterSidebar({
  state,
  onChange,
  priceBounds,
  availableSizes,
  availableColors,
  categories = [],
  activeSlug,
  className,
}: FilterSidebarProps) {
  const toggleValue = (list: Array<string>, value: string): Array<string> =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const maxValue = state.maxPrice ?? priceBounds.max;

  return (
    <aside className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-6">
        <SlidersHorizontal className="size-4 text-gray-900" aria-hidden />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-900">فیلترها</span>

        <button
          type="button"
          onClick={() => onChange({ sizes: [], colors: [], onlyAvailable: false, onlyDiscounted: false })}
          className="ms-auto text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
        >
          حذف همه
        </button>
      </div>

      {categories.length > 0 ? (
        <div className="mb-10">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-900">دسته‌بندی‌ها</h3>

          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to="/category/$slug"
                  params={{ slug: category.slug }}
                  className={cn(
                    "flex items-center justify-between text-[11px] transition-colors hover:text-gray-900",
                    category.slug === activeSlug ? "font-bold text-gray-900" : "text-gray-500",
                  )}
                >
                  <span>{category.title}</span>
                  <span className="text-[11px] opacity-70">{toFaDigits(category.productCount)}</span>
                </Link>
                {category.children.length > 0 ? (
                  <ul className="mt-1.5 space-y-1.5 ps-3">
                    {category.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          to="/category/$slug"
                          params={{ slug: child.slug }}
                          className={cn(
                            "flex items-center justify-between text-[11px] transition-colors hover:text-primary",
                            child.slug === activeSlug ? "font-bold text-primary" : "text-muted-foreground",
                          )}
                        >
                          <span>{child.title}</span>
                          <span className="opacity-70">{toFaDigits(child.productCount)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mb-10">
        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-900">محدودهٔ قیمت</h3>

        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={50000}
          value={maxValue}
          onChange={(event) => onChange({ ...state, maxPrice: Number(event.target.value) })}
          className="w-full accent-gray-900"
          aria-label="حداکثر قیمت"
        />
        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
          <span>{formatToman(priceBounds.min)}</span>
          <span className="font-bold text-gray-900">تا {formatToman(maxValue)}</span>
        </div>
      </div>

      {availableSizes.length > 0 ? (
        <div className="mb-10">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-900">سایز</h3>

          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const active = state.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ ...state, sizes: toggleValue(state.sizes, size) })}
                  className={cn(
                    "rounded-sm border px-2.5 py-1.5 text-[10px] font-semibold transition-colors shadow-sm",
                    active ? "border-gray-900 bg-gray-900 text-white" : "border-border bg-white text-gray-500 hover:border-gray-900",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {availableColors.length > 0 ? (
        <div className="rounded-sm border border-border bg-gray-50 p-4">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-900">رنگ</h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((item) => {
              const active = state.colors.includes(item.color);
              return (
                <button
                  key={item.color}
                  type="button"
                  title={item.color}
                  onClick={() => onChange({ ...state, colors: toggleValue(state.colors, item.color) })}
                  className={cn(
                    "flex items-center gap-1.5 rounded-sm border px-2 py-1.5 text-[10px] font-semibold transition-colors shadow-sm",
                    active ? "border-gray-900 text-gray-900 bg-white" : "border-border bg-white text-gray-400 hover:border-gray-900",
                  )}
                >
                  <span
                    className="size-4 rounded-full border border-border"
                    style={{ backgroundColor: item.hex ?? "#ddd" }}
                    aria-hidden
                  />
                  {item.color}
                  {active ? <Check className="size-3" aria-hidden /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-3 rounded-sm border border-border bg-gray-50 p-4">
        <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-gray-900">
          <input
            type="checkbox"
            checked={state.onlyAvailable}
            onChange={(event) => onChange({ ...state, onlyAvailable: event.target.checked })}
            className="size-4 accent-gray-900"
          />
          فقط کالاهای موجود
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-gray-900">
          <input
            type="checkbox"
            checked={state.onlyDiscounted}
            onChange={(event) => onChange({ ...state, onlyDiscounted: event.target.checked })}
            className="size-4 accent-gray-900"
          />
          فقط کالاهای دارای تخفیف
        </label>
      </div>
    </aside>
  );
}
