import { Link } from "@tanstack/react-router";
import { Check, SlidersHorizontal, X } from "lucide-react";

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

  const activeFiltersCount = (state.sizes?.length || 0) + (state.colors?.length || 0) + (state.onlyAvailable ? 1 : 0) + (state.onlyDiscounted ? 1 : 0);

  return (
    <aside className={cn("bg-white lg:bg-transparent h-full overflow-y-auto lg:overflow-visible p-6 lg:p-0", className)}>
      <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-gray-900" aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-900">فیلترها</span>
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-white size-5 rounded-full flex items-center justify-center text-[10px] font-bold">
              {toFaDigits(activeFiltersCount)}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={() => onChange({ sizes: [], colors: [], onlyAvailable: false, onlyDiscounted: false })}
            className="text-[10px] font-bold text-destructive hover:underline transition-all"
          >
            حذف همه
          </button>
        )}
        
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 -me-2">
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="space-y-10">
        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">دسته‌بندی‌ها</h3>
            <ul className="space-y-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: category.slug }}
                    className={cn(
                      "flex items-center justify-between text-[13px] transition-colors",
                      category.slug === activeSlug ? "font-bold text-gray-900" : "text-muted-foreground hover:text-gray-900",
                    )}
                  >
                    <span>{category.title}</span>
                    <span className="text-[11px] opacity-60 bg-muted px-2 py-0.5 rounded-full">{toFaDigits(category.productCount)}</span>
                  </Link>
                  {category.children.length > 0 && category.slug === activeSlug && (
                    <ul className="mt-3 space-y-2 ps-4 border-r-2 border-muted">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            to="/category/$slug"
                            params={{ slug: child.slug }}
                            className={cn(
                              "flex items-center justify-between text-[12px] transition-colors",
                              child.slug === activeSlug ? "font-bold text-primary" : "text-muted-foreground hover:text-primary",
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

        {/* Price Range */}
        <div>
          <h3 className="mb-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">محدوده قیمت</h3>
          <div className="space-y-4">
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={50000}
              value={maxValue}
              onChange={(event) => onChange({ ...state, maxPrice: Number(event.target.value) })}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground">از</span>
                <span className="text-xs font-bold text-gray-900">{formatToman(priceBounds.min)}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-muted-foreground">تا</span>
                <span className="text-xs font-bold text-gray-900">{formatToman(maxValue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sizes */}
        {availableSizes.length > 0 && (
          <div>
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">سایز</h3>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const active = state.sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onChange({ ...state, sizes: toggleValue(state.sizes, size) })}
                    className={cn(
                      "min-w-10 h-10 flex items-center justify-center rounded-lg border text-[11px] font-bold transition-all duration-200",
                      active ? "border-primary bg-primary text-white shadow-md shadow-primary/10" : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
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
          <div>
            <h3 className="mb-5 text-[10px] font-bold uppercase tracking-widest text-gray-400">رنگ</h3>
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
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "size-7 rounded-full border border-border p-0.5 transition-all duration-200 relative",
                        active && "ring-2 ring-foreground ring-offset-2"
                      )}
                    >
                      <span 
                        className="block h-full w-full rounded-full" 
                        style={{ backgroundColor: item.hex ?? "#ddd" }} 
                      />
                      {active && <Check className="absolute inset-0 m-auto size-3 text-white mix-blend-difference" />}
                    </span>
                    <span className="text-[10px] font-medium">{item.color}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Filters */}
        <div className="space-y-4 pt-6 border-t border-border">
          <label className="flex cursor-pointer items-center justify-between group">
            <span className="text-[12px] font-medium text-gray-900 group-hover:text-primary transition-colors">فقط کالاهای موجود</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.onlyAvailable}
                onChange={(event) => onChange({ ...state, onlyAvailable: event.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
          <label className="flex cursor-pointer items-center justify-between group">
            <span className="text-[12px] font-medium text-gray-900 group-hover:text-primary transition-colors">فقط کالاهای دارای تخفیف</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={state.onlyDiscounted}
                onChange={(event) => onChange({ ...state, onlyDiscounted: event.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
        </div>
      </div>
    </aside>
  );
}