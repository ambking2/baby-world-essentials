import { StoreProductCard } from "@/components/store/StoreProductCard";
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
      <div className="rounded-3xl border border-dashed border-border bg-secondary/30 p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const columnClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  } as const;

  return (
    <div ref={containerRef} className={cn("grid grid-cols-2 gap-3 sm:gap-5", columnClass[columns], className)}>
      {products.map((product) => (
        <StoreProductCard
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
