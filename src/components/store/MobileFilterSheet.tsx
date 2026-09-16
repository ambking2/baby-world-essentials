import type { ReactNode } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { FilterSidebar, type FilterState } from "@/components/store/FilterSidebar";
import type { Category } from "@/server/repo/catalog";

type MobileFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: FilterState;
  onChange: (next: FilterState) => void;
  priceBounds: { min: number; max: number };
  availableSizes: Array<string>;
  availableColors: Array<{ color: string; hex: string | null }>;
  categories?: Array<Category>;
  activeSlug?: string;
  children?: ReactNode;
};

/**
 * فیلترهای دسکتاپ داخل یک شیت کشویی برای موبایل — همان FilterSidebar با همان state.
 */
export function MobileFilterSheet({
  open,
  onOpenChange,
  state,
  onChange,
  priceBounds,
  availableSizes,
  availableColors,
  categories = [],
  activeSlug,
}: MobileFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[86vw] max-w-sm overflow-y-auto overscroll-contain p-4 sm:max-w-sm"
      >
        <SheetTitle className="sr-only">فیلتر محصولات</SheetTitle>
        <FilterSidebar
          state={state}
          onChange={onChange}
          priceBounds={priceBounds}
          availableSizes={availableSizes}
          availableColors={availableColors}
          categories={categories}
          {...(activeSlug !== undefined ? { activeSlug } : {})}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
