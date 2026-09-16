import { Link } from "@tanstack/react-router";
import { Heart, Plus, Star } from "lucide-react";
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
 * کارت محصول — چیدمان عمودی: عکس بالا، عنوان زیر عکس، قیمت پایین.
 * در موبایل فشرده و کوچک (مطابق طرح مرجع)، از sm به بالا سایز کامل.
 */
export function ProductCard({
  product,
  className,
  inWishlist,
  busy,
  eager,
  compact,
  onAddToCart,
  onToggleWishlist,
}: {
  product: ProductLike;
  className?: string;
  inWishlist?: boolean;
  busy?: boolean;
  eager?: boolean;
  compact?: boolean;
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
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col",
        compact && "overflow-hidden rounded-xl bg-white shadow-sm",
        className,
      )}
    >
      {/* Image — بالا: مربع کوچک در موبایل، 3/4 از sm به بالا */}
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden bg-surface-container-low sm:aspect-[3/4] sm:rounded-lg",
          compact ? "rounded-t-xl rounded-b-none" : "rounded-xl",
        )}
      >
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
        <div className="absolute top-2 right-2 z-10 flex flex-col items-start gap-1 sm:top-3 sm:right-3 sm:gap-1.5">
          {off > 0 && !outOfStock ? (
            <span className="rounded-full bg-red-400 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm sm:px-3 sm:py-1 sm:text-[11px]">
              ٪{toFaDigits(off)} تخفیف
            </span>
          ) : null}
          {showBest ? (
            <span className="hidden rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white shadow-sm sm:inline-flex">
              پرفروش
            </span>
          ) : null}
          {product.madeInWorkshop ? (
            <span className="hidden rounded-full bg-white px-3 py-1 text-[11px] font-bold text-foreground shadow-sm sm:inline-flex">
              ساخت کارگاه
            </span>
          ) : null}
          {outOfStock ? (
            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm sm:px-3 sm:py-1 sm:text-[11px]">
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
          className="absolute left-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm transition-all duration-300 hover:text-primary active:scale-95 sm:left-3 sm:top-3 sm:size-9"
        >
          <Heart className={cn("size-4", inWishlist && "fill-primary text-primary")} />
        </button>
      </div>

      {/* Details — زیر عکس: عنوان، سپس قیمت */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-0.5 pt-2 sm:gap-1 sm:pt-3",
          compact && "px-2 pb-2 sm:px-3 sm:pb-3",
        )}
      >
        {product.categoryTitle ? (
          <span className="hidden text-[11px] font-medium tracking-wide text-zinc-400 sm:block">
            {product.categoryTitle}
          </span>
        ) : null}

        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className="line-clamp-2 text-[12px] font-semibold leading-5 text-foreground transition-colors duration-300 group-hover:text-primary sm:font-serif sm:text-[15px] sm:leading-7">
            {product.title}
          </h3>
        </Link>

        {rating > 0 ? (
          <div className="mt-0.5 hidden items-center gap-1 sm:flex">
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

        {/* Price + add */}
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-1 sm:items-baseline sm:justify-start sm:pt-1">
          <div className="flex min-w-0 flex-col gap-0 sm:flex-row sm:items-baseline sm:gap-2">
            {original && original > current ? (
              <span className="text-[10px] text-zinc-400 line-through sm:text-[12px]">
                {formatToman(original, false)}
              </span>
            ) : null}
            <span className="text-[13px] font-bold text-foreground sm:text-[15px]">
              {formatToman(current, false)}
              <span className="ms-1 text-[10px] font-medium text-zinc-400">تومان</span>
            </span>
          </div>
          {/* دکمهٔ افزودن — فقط موبایل */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock || busy}
            aria-label="افزودن به سبد خرید"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-charcoal text-white transition-all duration-300 hover:bg-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
