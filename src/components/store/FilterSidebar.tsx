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
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <SlidersHorizontal className="size-4 text-brand" aria-hidden />
        <span className="text-sm font-extrabold">فیلتر محصولات</span>
        <button
          type="button"
          onClick={() => onChange({ sizes: [], colors: [], onlyAvailable: false, onlyDiscounted: false })}
          className="ms-auto text-[11px] text-muted-foreground hover:text-sale"
        >
          حذف همه
        </button>
      </div>

      {categories.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-extrabold text-foreground">دسته‌بندی‌ها</h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to="/category/$slug"
                  params={{ slug: category.slug }}
                  className={cn(
                    "flex items-center justify-between text-xs transition-colors hover:text-brand",
                    category.slug === activeSlug ? "font-extrabold text-brand" : "text-muted-foreground",
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
                            "flex items-center justify-between text-[11px] transition-colors hover:text-brand",
                            child.slug === activeSlug ? "font-bold text-brand" : "text-muted-foreground",
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

      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 text-xs font-extrabold text-foreground">محدودهٔ قیمت</h3>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={50000}
          value={maxValue}
          onChange={(event) => onChange({ ...state, maxPrice: Number(event.target.value) })}
          className="w-full accent-[var(--color-brand)]"
          aria-label="حداکثر قیمت"
        />
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{formatToman(priceBounds.min)}</span>
          <span className="font-bold text-foreground">تا {formatToman(maxValue)}</span>
        </div>
      </div>

      {availableSizes.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-extrabold text-foreground">سایز</h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const active = state.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ ...state, sizes: toggleValue(state.sizes, size) })}
                  className={cn(
                    "rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                    active ? "border-brand bg-brand text-primary-foreground" : "border-border text-muted-foreground hover:border-brand",
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
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-xs font-extrabold text-foreground">رنگ</h3>
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
                    "flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[11px] font-semibold transition-colors",
                    active ? "border-brand text-brand" : "border-border text-muted-foreground hover:border-brand",
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

      <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={state.onlyAvailable}
            onChange={(event) => onChange({ ...state, onlyAvailable: event.target.checked })}
            className="size-4 accent-[var(--color-brand)]"
          />
          فقط کالاهای موجود
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={state.onlyDiscounted}
            onChange={(event) => onChange({ ...state, onlyDiscounted: event.target.checked })}
            className="size-4 accent-[var(--color-brand)]"
          />
          فقط کالاهای دارای تخفیف
        </label>
      </div>
    </aside>
  );
}
