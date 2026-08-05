import { Link } from "@tanstack/react-router";
import { Eye, Heart, ShoppingCart, Sparkles } from "lucide-react";

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
    <article className={cn("card-hover group storybook-panel flex h-full flex-col p-2", className)}>
      <div className="relative overflow-hidden rounded-[1.7rem] bg-[linear-gradient(180deg,#fff8f2_0%,#ffffff_100%)]">
        <div className="absolute start-3 top-3 z-10 flex flex-col gap-1.5">
          {product.badge ? (
            <span className="rounded-full bg-gradient-to-r from-brand to-sale px-3 py-1 text-[11px] font-extrabold text-primary-foreground shadow-soft">
              {product.badge}
            </span>
          ) : null}
          {product.madeInWorkshop ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-brand shadow-soft">
              ساخت کارگاه
            </span>
          ) : null}
          {soldOut ? (
            <span className="rounded-full bg-charcoal px-3 py-1 text-[11px] font-bold text-white shadow-soft">ناموجود</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onToggleWishlist?.(product)}
          aria-label={inWishlist ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          className="absolute end-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full border border-white/80 bg-white/88 text-muted-foreground shadow-soft transition-all hover:text-sale"
        >
          <Heart className={cn("size-4", inWishlist && "fill-sale text-sale")} aria-hidden />
        </button>

        <Link to="/product/$slug" params={{ slug: product.slug }} className="block overflow-hidden rounded-[1.7rem]">
          <img
            src={product.cover ?? "/images/cat-clothing.jpg"}
            alt={product.title}
            loading="lazy"
            className="aspect-[1/1.02] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-3 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          {product.categoryTitle ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-extrabold text-brand">
              <Sparkles className="size-3" aria-hidden />
              {product.categoryTitle}
            </span>
          ) : <span />}
          {product.soldCount > 0 ? <span className="text-[10px] text-muted-foreground">{formatCount(product.soldCount)} فروش</span> : null}
        </div>

        <h3 className="line-clamp-2 text-sm font-black leading-6 text-foreground">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="transition-colors hover:text-brand">
            {product.title}
          </Link>
        </h3>

        {product.subtitle ? <p className="line-clamp-2 text-xs leading-6 text-muted-foreground">{product.subtitle}</p> : null}

        <Rating value={product.ratingAverage} count={product.ratingCount} />

        {product.saleActive && product.saleEndsAt ? <Countdown endsAt={product.saleEndsAt} /> : null}

        <div className="mt-auto rounded-[1.5rem] border border-white/70 bg-white/80 p-3 shadow-soft">
          <Price price={product.price} effectivePrice={product.effectivePrice} discountPercent={product.discountPercent} />

          <div className="mt-3 flex items-center gap-2">
            {isClothing || !onAddToCart ? (
              <Link
                to="/product/$slug"
                params={{ slug: product.slug }}
                className="toy-button inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-sale px-3 py-3 text-xs font-extrabold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                <Eye className="size-4" aria-hidden />
                {isClothing ? "انتخاب سایز و خرید" : "مشاهدهٔ محصول"}
              </Link>
            ) : (
              <button
                type="button"
                disabled={soldOut || busy}
                onClick={() => onAddToCart(product)}
                className="toy-button inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-sale px-3 py-3 text-xs font-extrabold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <ShoppingCart className="size-4" aria-hidden />
                {soldOut ? "ناموجود" : busy ? "در حال افزودن…" : "افزودن به سبد"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
