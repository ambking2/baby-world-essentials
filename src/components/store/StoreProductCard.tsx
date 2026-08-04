import { Link } from "@tanstack/react-router";
import { Eye, Heart, ShoppingCart } from "lucide-react";

import { Countdown } from "@/components/store/Countdown";
import { Price } from "@/components/store/Price";
import { Rating } from "@/components/store/Rating";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/format";
import type { ProductCard as ProductCardData } from "@/server/repo/products";

type StoreProductCardProps = {
  product: ProductCardData;
  onAddToCart?: (product: ProductCardData) => void;
  onToggleWishlist?: (product: ProductCardData) => void;
  inWishlist?: boolean;
  busy?: boolean;
  className?: string;
};

/** کارت محصول فروشگاه با هور نرم، دکمهٔ سریع خرید و برچسب‌ها. */
export function StoreProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  inWishlist = false,
  busy = false,
  className,
}: StoreProductCardProps) {
  const soldOut = product.stock <= 0;
  const isClothing = product.categoryKind === "clothing";

  return (
    <article
      className={cn(
        "card-hover group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card",
        className,
      )}
    >
      <div className="absolute start-3 top-3 z-10 flex flex-col gap-1.5">
        {product.badge ? (
          <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-soft">
            {product.badge}
          </span>
        ) : null}
        {product.madeInWorkshop ? (
          <span className="rounded-full bg-installment px-2.5 py-1 text-[11px] font-bold text-installment-foreground">
            تولید کارگاه خودمان
          </span>
        ) : null}
        {soldOut ? (
          <span className="rounded-full bg-charcoal px-2.5 py-1 text-[11px] font-bold text-white">ناموجود</span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onToggleWishlist?.(product)}
        aria-label={inWishlist ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
        className="absolute end-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-soft transition-all hover:text-sale"
      >
        <Heart className={cn("size-4", inWishlist && "fill-sale text-sale")} aria-hidden />
      </button>

      <Link to="/product/$slug" params={{ slug: product.slug }} className="block overflow-hidden bg-secondary/40">
        <img
          src={product.cover ?? "/images/cat-clothing.jpg"}
          alt={product.title}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.categoryTitle ? (
          <span className="text-[11px] font-semibold text-brand">{product.categoryTitle}</span>
        ) : null}

        <h3 className="line-clamp-2 text-sm font-bold leading-6 text-foreground">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="transition-colors hover:text-brand">
            {product.title}
          </Link>
        </h3>

        {product.subtitle ? (
          <p className="line-clamp-1 text-xs text-muted-foreground">{product.subtitle}</p>
        ) : null}

        <Rating value={product.ratingAverage} count={product.ratingCount} />

        {product.saleActive && product.saleEndsAt ? <Countdown endsAt={product.saleEndsAt} /> : null}

        <div className="mt-auto space-y-3 pt-1">
          <Price price={product.price} effectivePrice={product.effectivePrice} discountPercent={product.discountPercent} />

          <div className="flex items-center gap-2">
            {isClothing || !onAddToCart ? (
              <Link
                to="/product/$slug"
                params={{ slug: product.slug }}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-3 py-2.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                <Eye className="size-4" aria-hidden />
                {isClothing ? "انتخاب سایز و خرید" : "مشاهدهٔ محصول"}
              </Link>
            ) : (
              <button
                type="button"
                disabled={soldOut || busy}
                onClick={() => onAddToCart(product)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-3 py-2.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <ShoppingCart className="size-4" aria-hidden />
                {soldOut ? "ناموجود" : busy ? "در حال افزودن…" : "افزودن به سبد"}
              </button>
            )}
          </div>

          {product.soldCount > 0 ? (
            <p className="text-[11px] text-muted-foreground">{formatCount(product.soldCount)} فروش موفق</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
