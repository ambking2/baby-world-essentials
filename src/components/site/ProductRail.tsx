import type { Product } from "@/types/catalog";
import { ProductCard } from "@/components/site/ProductCard";

/**
 * Horizontal snap rail on mobile, plain grid from md up.
 * Used for product-heavy homepage rows so more items are reachable
 * without a long vertical scroll on phones.
 */
export function ProductRail({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <>
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {products.map((p) => (
          <li key={p.id} className="w-[46%] shrink-0 snap-start">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>

      <div className="hidden gap-3 md:grid md:grid-cols-3 lg:grid-cols-4 xl:gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
