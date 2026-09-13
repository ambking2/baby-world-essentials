import { Link } from "@tanstack/react-router";
import { Check, ChevronLeft, SlidersHorizontal, X } from "lucide-react";

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
  onClose?: () => void;
};

const FILTER_CARD = "rounded-lg border border-surface-container-high bg-surface-container-lowest p-6 shadow-sm";
const FILTER_TITLE = "font-label-md text-label-md mb-4 font-bold text-on-surface";

/** سایدبار فیلتر — مطابق مرجع: کارت‌های جدا برای دسته، قیمت، سایز، رنگ و سوییچ‌ها. */
export function FilterSidebar({
  state,
  onChange,
  priceBounds,
  availableSizes,
  availableColors,
  categories = [],
  activeSlug,
  className,
  onClose,
}: FilterSidebarProps) {
  const toggleValue = (list: Array<string>, value: string): Array<string> =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const maxValue = state.maxPrice ?? priceBounds.max;

  const activeFiltersCount =
    (state.sizes?.length || 0) +
    (state.colors?.length || 0) +
    (state.onlyAvailable ? 1 : 0) +
    (state.onlyDiscounted ? 1 : 0);

  return (
    <aside className={cn("h-full overflow-y-auto lg:overflow-visible", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" aria-hidden />
          <span className="font-label-md text-label-md text-on-surface">فیلترها</span>
          {activeFiltersCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
              {toFaDigits(activeFiltersCount)}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={() => onChange({ sizes: [], colors: [], onlyAvailable: false, onlyDiscounted: false })}
            className="text-[11px] font-bold text-destructive hover:underline"
          >
            حذف همه
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="p-2 lg:hidden" aria-label="بستن فیلترها">
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-gutter">
        {/* Categories tree */}
        {categories.length > 0 && (
          <div className={FILTER_CARD}>
            <h3 className={FILTER_TITLE}>دسته‌بندی‌ها</h3>
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: category.slug }}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors",
                      category.slug === activeSlug
                        ? "bg-primary-fixed font-bold text-on-primary-fixed"
                        : "text-on-surface-variant hover:bg-surface-container-low",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <ChevronLeft className="size-3.5 opacity-50" />
                      {category.title}
                    </span>
                    <span className="text-[11px] opacity-60">{toFaDigits(category.productCount)}</span>
                  </Link>
                  {category.children.length > 0 && category.slug === activeSlug && (
                    <ul className="mt-1 space-y-0.5 pr-7">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            to="/category/$slug"
                            params={{ slug: child.slug }}
                            className={cn(
                              "flex items-center justify-between rounded-lg px-3 py-1.5 text-[12px] transition-colors",
                              child.slug === activeSlug
                                ? "font-bold text-primary"
                                : "text-on-surface-variant hover:text-primary",
                            )}
                          >
                            <span>{child.title}</span>
                            <span className="opacity-60">{toFaDigits(child.productCount)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Price range */}
        <div className={FILTER_CARD}>
          <h3 className={FILTER_TITLE}>محدودهٔ قیمت</h3>
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={50000}
            value={maxValue}
            onChange={(event) => onChange({ ...state, maxPrice: Number(event.target.value) })}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg accent-primary"
          />
          <div className="mt-3 flex items-center justify-between text-[12px]">
            <span className="text-on-surface-variant">از {formatToman(priceBounds.min)}</span>
            <span className="font-bold text-primary">تا {formatToman(maxValue)}</span>
          </div>
        </div>

        {/* Sizes */}
        {availableSizes.length > 0 && (
          <div className={FILTER_CARD}>
            <h3 className={FILTER_TITLE}>سایز</h3>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const active = state.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onChange({ ...state, sizes: toggleValue(state.sizes, size) })}
                    className={cn(
                      "flex h-10 min-w-10 items-center justify-center rounded-full border px-2 text-[12px] font-bold transition-all",
                      active
                        ? "border-primary bg-primary text-on-primary shadow-md shadow-primary/20"
                        : "border-outline-variant text-on-surface-variant hover:border-primary/50 hover:text-primary",
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Colors */}
        {availableColors.length > 0 && (
          <div className={FILTER_CARD}>
            <h3 className={FILTER_TITLE}>رنگ</h3>
            <div className="flex flex-wrap gap-4">
              {availableColors.map((item) => {
                const active = state.colors.includes(item.color);
                return (
                  <button
                    key={item.color}
                    type="button"
                    title={item.color}
                    onClick={() => onChange({ ...state, colors: toggleValue(state.colors, item.color) })}
                    className={cn(
                      "group flex flex-col items-center gap-1.5",
                      active ? "text-primary" : "text-on-surface-variant hover:text-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "relative size-7 rounded-full border border-outline-variant p-0.5 transition-all",
                        active && "ring-4 ring-primary-fixed",
                      )}
                    >
                      <span
                        className="block h-full w-full rounded-full"
                        style={{ backgroundColor: item.hex ?? "#ddd" }}
                      />
                      {active && (
                        <Check className="absolute inset-0 m-auto size-3 text-white mix-blend-difference" />
                      )}
                    </span>
                    <span className="text-[10px] font-medium">{item.color}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Toggles */}
        <div className={cn(FILTER_CARD, "space-y-4")}>
          <label className="flex cursor-pointer items-center justify-between group">
            <span className="text-[13px] font-medium text-on-surface group-hover:text-primary transition-colors">
              فقط کالاهای موجود
            </span>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={state.onlyAvailable}
                onChange={(event) => onChange({ ...state, onlyAvailable: event.target.checked })}
                className="peer sr-only"
              />
              <span className="h-6 w-11 rounded-full bg-surface-container-high transition-colors peer-checked:bg-primary after:absolute after:top-[2px] after:right-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:-translate-x-5" />
            </span>
          </label>
          <label className="flex cursor-pointer items-center justify-between group">
            <span className="text-[13px] font-medium text-on-surface group-hover:text-primary transition-colors">
              فقط کالاهای دارای تخفیف
            </span>
            <span className="relative inline-flex items-center">
              <input
                type="checkbox"
                checked={state.onlyDiscounted}
                onChange={(event) => onChange({ ...state, onlyDiscounted: event.target.checked })}
                className="peer sr-only"
              />
              <span className="h-6 w-11 rounded-full bg-surface-container-high transition-colors peer-checked:bg-primary after:absolute after:top-[2px] after:right-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:-translate-x-5" />
            </span>
          </label>
        </div>
      </div>
    </aside>
  );
}
