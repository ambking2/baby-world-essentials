import { Link } from "@tanstack/react-router";
import { Heart, Search, Star } from "lucide-react";
import { toast } from "sonner";

import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProductLike = {
  slug: string;
  title: string;
  stock?: number;
  price?: number;
  oldPrice?: number;
  effectivePrice?: number;
  discountPercent?: number;
  cover?: string | null;
  image?: string;
  badge?: string | null;
  tags?: Array<string>;
  brand?: string;
  categoryTitle?: string | null;
  rating?: number;
  ratingAverage?: number;
  reviewCount?: number;
  ratingCount?: number;
  isFeatured?: boolean;
  madeInWorkshop?: boolean;
  saleActive?: boolean;
  soldCount?: number;
};

function cardPricing(product: ProductLike) {
  const list = Number(product.price ?? 0);
  const sale = Number(product.effectivePrice ?? product.price ?? 0);
  const fromFields =
    typeof product.discountPercent === "number" && product.discountPercent > 0
      ? product.discountPercent
      : 0;
  const fromOldPrice =
    product.oldPrice && product.oldPrice > list
      ? Math.round(((product.oldPrice - list) / product.oldPrice) * 100)
      : 0;
  const fromEffective = list > 0 && sale < list ? Math.round(((list - sale) / list) * 100) : 0;
  const off = fromFields || fromOldPrice || fromEffective;
  const current = product.oldPrice && product.oldPrice > list ? list : sale || list;
  const original =
    off > 0 ? (product.oldPrice && product.oldPrice > list ? product.oldPrice : list) : null;
  return { current, original, off };
}

/**
 * کارت محصول — سبک MOOD.: نسبت 3/4، بج‌ها بالا-شروع، دکمهٔ نمای سریع و
 * علاقه‌مندی که با هاور ظاهر می‌شوند، تیتر سریف‌نما، قیمت و رنگ‌ها زیر آن.
 */
export function ProductCard({
  product,
  className,
  inWishlist,
  busy,
  eager,
  onAddToCart,
  onToggleWishlist,
}: {
  product: ProductLike;
  className?: string;
  inWishlist?: boolean;
  busy?: boolean;
  eager?: boolean;
  onAddToCart?: (product: ProductLike) => void;
  onToggleWishlist?: (product: ProductLike) => void;
}) {
  const { current, original, off } = cardPricing(product);
  const outOfStock = (product.stock ?? 0) <= 0;
  const rating = product.ratingAverage ?? product.rating ?? 0;
  const reviewCount = product.ratingCount ?? product.reviewCount ?? 0;
  const tags = product.tags ?? [];
  const showBest =
    tags.includes("best") || tags.includes("best-seller") || product.badge === "پرفروش";

  const handleAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    if (outOfStock) return;
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      toast.success("به سبد خرید اضافه شد");
    }
  };

  return (
    <article className={cn("group flex h-full min-w-0 flex-col", className)}>
      {/* Image — aspect 3/4 */}
      <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-surface-container-low">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={product.image || product.cover || "/assets/images/nursery-6.jpg"}
            alt={product.title}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
              outOfStock && "opacity-70",
            )}
          />
        </Link>

        {/* Badges — top start */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-start gap-1.5">
          {off > 0 && !outOfStock ? (
            <span className="rounded-full bg-red-400 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              ٪{toFaDigits(off)} تخفیف
            </span>
          ) : null}
          {showBest ? (
            <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              پرفروش
            </span>
          ) : null}
          {product.madeInWorkshop ? (
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-foreground shadow-sm">
              ساخت کارگاه
            </span>
          ) : null}
          {outOfStock ? (
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              ناموجود
            </span>
          ) : null}
        </div>

        {/* Wishlist — revealed on hover */}
        <button
          onClick={(event) => {
            event.preventDefault();
            if (onToggleWishlist) {
              onToggleWishlist(product);
            } else {
              toast.success("به علاقه‌مندی‌ها اضافه شد");
            }
          }}
          aria-label={inWishlist ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          className="absolute left-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm transition-all duration-300 hover:text-primary active:scale-95"
        >
          <Heart className={cn("size-4", inWishlist && "fill-primary text-primary")} />
        </button>

        {/* Quick actions — slide up on hover */}
        <div className="absolute inset-x-4 bottom-4 z-10 flex translate-y-4 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock || busy}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-zinc-900 text-[12px] font-bold text-white transition-colors duration-300 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {outOfStock ? "ناموجود" : busy ? "…" : "افزودن به سبد"}
          </button>
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            aria-label="نمایش سریع"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-colors duration-300 hover:bg-primary hover:text-white"
          >
            <Search className="size-4" />
          </Link>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1 pt-3">
        {product.categoryTitle ? (
          <span className="text-[11px] font-medium tracking-wide text-zinc-400">
            {product.categoryTitle}
          </span>
        ) : null}

        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className="font-serif line-clamp-2 text-[15px] font-semibold leading-7 text-foreground transition-colors duration-300 group-hover:text-primary">
            {product.title}
          </h3>
        </Link>

        {rating > 0 ? (
          <div className="mt-0.5 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-3",
                  i < Math.round(rating) ? "fill-primary text-primary" : "text-zinc-300",
                )}
                aria-hidden
              />
            ))}
            {reviewCount > 0 ? (
              <span className="text-[10px] text-zinc-400">({toFaDigits(reviewCount)})</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-1 flex items-baseline gap-2">
          {original && original > current ? (
            <span className="text-[12px] text-zinc-400 line-through">
              {formatToman(original, false)}
            </span>
          ) : null}
          <span className="text-[15px] font-bold text-foreground">
            {formatToman(current, false)}
            <span className="ms-1 text-[10px] font-medium text-zinc-400">تومان</span>
          </span>
        </div>
      </div>
    </article>
  );
}
