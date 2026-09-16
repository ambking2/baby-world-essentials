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
 * کارت محصول — در موبایل چیدمان افقی فشرده (تصویر مربع کوچک + متن و قیمت کنار هم)
 * و از sm به بالا کارت گرید عمودی مطابق الگوی «Lullaby & Play».
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
    <article
      className={cn(
        "product-card group flex h-full min-w-0 flex-row gap-3 rounded-lg border border-surface-container-high bg-surface-container-lowest p-3 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_30px_rgba(0,75,209,0.12)] sm:flex-col sm:gap-0 sm:p-card-padding",
        className,
      )}
    >
      {/* Image area — مربع کوچک در موبایل، تمام‌عرض از sm به بالا */}
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-lg bg-surface-container-low sm:w-auto">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={product.image || product.cover || "/assets/images/nursery-6.jpg"}
            alt={product.title}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
              outOfStock && "opacity-60",
            )}
          />
        </Link>

        {/* Discount / status badges — top start */}
        <div className="absolute right-2 top-2 z-10 flex flex-col items-start gap-1 sm:right-3 sm:top-3 sm:gap-1.5">
          {off > 0 && !outOfStock ? (
            <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary shadow-md sm:px-3 sm:py-1 sm:text-xs">
              ٪{toFaDigits(off)} تخفیف
            </span>
          ) : null}
          {showBest ? (
            <span className="hidden rounded-full bg-tertiary-container px-3 py-1 text-[11px] font-bold text-on-tertiary shadow-md sm:inline-flex">
              پرفروش
            </span>
          ) : null}
          {product.madeInWorkshop ? (
            <span className="hidden rounded-full bg-surface-container-lowest/90 px-3 py-1 text-[11px] font-bold text-primary shadow-sm sm:inline-flex">
              ساخت کارگاه
            </span>
          ) : null}
          {outOfStock ? (
            <span className="rounded-full bg-on-surface px-2 py-0.5 text-[10px] font-bold text-surface shadow-md sm:px-3 sm:py-1 sm:text-[11px]">
              ناموجود
            </span>
          ) : null}
        </div>

        {/* Wishlist — top end, revealed on hover */}
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
          className="absolute left-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-white/80 text-on-surface-variant shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:text-destructive active:scale-95 sm:left-3 sm:top-3 sm:size-10 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <Heart
            className={cn("size-4 sm:size-5", inWishlist && "fill-destructive text-destructive")}
          />
        </button>

        {outOfStock ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-container-low/60">
            <span className="rounded-full bg-on-surface px-3 py-1 text-[10px] font-bold text-surface sm:px-4 sm:text-xs">
              ناموجود
            </span>
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col justify-center sm:justify-start sm:pt-4">
        {product.categoryTitle ? (
          <span className="mb-1.5 hidden self-start rounded-full bg-primary-fixed px-2.5 py-0.5 text-[11px] font-bold text-on-primary-fixed sm:inline-flex">
            {product.categoryTitle}
          </span>
        ) : null}

        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className="line-clamp-2 text-[13px] font-bold leading-5 text-on-surface transition-colors group-hover:text-primary sm:font-headline-sm sm:text-headline-sm sm:leading-8">
            {product.title}
          </h3>
        </Link>

        {rating > 0 ? (
          <div className="mt-2 hidden items-center gap-1.5 sm:flex">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5",
                    i < Math.round(rating)
                      ? "fill-orange-400 text-orange-400"
                      : "text-outline-variant",
                  )}
                  aria-hidden
                />
              ))}
            </span>
            {reviewCount > 0 ? (
              <span className="text-[11px] text-on-surface-variant">
                ({toFaDigits(reviewCount)} نظر)
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Price + add — footer row */}
        <div className="mt-2 flex items-end justify-between gap-2 border-t border-surface-container-low pt-2 sm:mt-auto sm:pt-4">
          <div className="flex flex-col gap-0.5">
            {original && original > current ? (
              <span className="text-[11px] text-on-surface-variant line-through sm:text-[12px]">
                {formatToman(original)}
              </span>
            ) : null}
            <span className="text-[14px] font-extrabold text-primary sm:font-price-display sm:text-price-display">
              {formatToman(current)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock || busy}
            aria-label="افزودن به سبد خرید"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:size-12"
          >
            <Plus className="size-5 sm:size-6" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
