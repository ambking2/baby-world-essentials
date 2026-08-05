import { ProductCard } from "@/components/site/ProductCard";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardData } from "@/server/repo/products";

type ProductGridProps = {
  products: Array<ProductCardData>;
  columns?: 2 | 3 | 4;
  onAddToCart?: (product: ProductCardData) => void;
  onToggleWishlist?: (product: ProductCardData) => void;
  wishlistIds?: Array<number>;
  busyId?: number | null;
  emptyMessage?: string;
  className?: string;
};

/** گرید محصولات با نمایش تدریجی هنگام اسکرول. */
export function ProductGrid({
  products,
  columns = 4,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  busyId = null,
  emptyMessage = "محصولی با این فیلترها پیدا نشد.",
  className,
}: ProductGridProps) {
  const containerRef = useReveal<HTMLDivElement>({ stagger: 70 });

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[32px] border border-border bg-[#F9F9F9] p-16 md:p-24 text-center shadow-sm">
        <div className="size-16 bg-white rounded-full flex items-center justify-center border border-border mb-6">
          <svg className="size-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">نتیجه‌ای پیدا نشد</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const columnClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  } as const;

  return (
    <div ref={containerRef} className={cn("grid grid-cols-2 gap-4 lg:gap-8", columnClass[columns], className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          className="reveal"
          inWishlist={wishlistIds.includes(product.id)}
          busy={busyId === product.id}
          {...(onAddToCart ? { onAddToCart } : {})}
          {...(onToggleWishlist ? { onToggleWishlist } : {})}
        />
      ))}
    </div>
  );
}
