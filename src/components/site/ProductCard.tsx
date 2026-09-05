import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
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
  const original = off > 0 ? (product.oldPrice && product.oldPrice > list ? product.oldPrice : list) : null;
  return { current, original, off };
}

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
  const showNew = tags.includes("new");
  const showBest = tags.includes("best") || tags.includes("best-seller") || product.badge === "پرفروش";
  const showFeatured = product.isFeatured === true;
  const showWorkshop = product.madeInWorkshop === true;

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col bg-white border border-accent/60 rounded-[14px] transition-all duration-300 hover:-translate-y-1 hover:shadow-premium",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[14px] bg-secondary/30">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <div className="absolute inset-0 skeleton" />
          <img
            src={product.image || product.cover || "/assets/images/nursery-6.jpg"}
            alt={product.title}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={eager ? "high" : "low"}
            onLoad={(e) => {
              const skeleton = e.currentTarget.previousElementSibling as HTMLElement | null;
              if (skeleton) skeleton.style.display = "none";
            }}
            className={cn(
              "relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
              outOfStock && "opacity-60",
            )}
          />
        </Link>

        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {off > 0 && !outOfStock ? (
            <span className="bg-destructive text-white px-2 py-1 text-[10px] font-bold rounded-md shadow-sm">
              {toFaDigits(off)}٪ تخفیف
            </span>
          ) : null}
          {product.saleActive ? (
            <span className="bg-orange-500 text-white px-2 py-1 text-[10px] font-bold rounded-md shadow-sm">
              تخفیف لحظه‌ای
            </span>
          ) : null}
          {product.badge && product.badge !== "پرفروش" ? (
            <span className="bg-primary text-white px-2 py-1 text-[10px] font-bold rounded-md shadow-sm">
              {product.badge}
            </span>
          ) : null}
          {showNew ? (
            <span className="bg-primary text-white px-2 py-1 text-[10px] font-bold rounded-md shadow-sm">جدید</span>
          ) : null}
          {showBest ? (
            <span className="bg-amber-100 text-amber-800 px-2 py-1 text-[10px] font-bold rounded-md border border-amber-200">
              پرفروش
            </span>
          ) : null}
          {showFeatured && !showBest && !showNew ? (
            <span className="bg-primary/90 text-white px-2 py-1 text-[10px] font-bold rounded-md shadow-sm">ویژه</span>
          ) : null}
          {showWorkshop ? (
            <span className="bg-white/95 text-primary px-2 py-1 text-[10px] font-bold rounded-md border border-primary/20 shadow-sm">
              ساخت کارگاه
            </span>
          ) : null}
          {outOfStock ? (
            <span className="bg-charcoal text-white px-2 py-1 text-[10px] font-bold rounded-md shadow-sm">ناموجود</span>
          ) : null}
        </div>

        <button
          onClick={() =>
            onToggleWishlist ? onToggleWishlist(product) : toast.success("به علاقه‌مندی‌ها اضافه شد")
          }
          className="absolute right-4 top-4 z-10 p-2 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 active:scale-90"
        >
          <Heart className={cn("size-4", inWishlist && "fill-destructive text-destructive")} />
        </button>

        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={() => (onAddToCart ? onAddToCart(product) : toast.success("به سبد خرید اضافه شد"))}
            disabled={outOfStock || busy}
            className="w-full bg-primary text-white py-3 text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-all duration-300 active:scale-[0.97] shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {outOfStock ? "ناموجود" : busy ? "در حال افزودن…" : "افزودن سریع"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="mb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          {product.brand || product.categoryTitle || "جهان کودک"}
        </div>

        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className="mb-2 text-[14px] font-semibold leading-relaxed text-gray-900 transition-colors hover:text-primary line-clamp-2 min-h-[2.8em]">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn("size-3", i <= Math.round(rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200")}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">({toFaDigits(reviewCount)})</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-base font-bold text-gray-900">{formatToman(current)}</span>
                {original && original > current ? (
                  <span className="text-[12px] text-muted-foreground line-through opacity-60">
                    {formatToman(original)}
                  </span>
                ) : null}
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart ? onAddToCart(product) : toast.success("به سبد خرید اضافه شد");
                }}
                disabled={outOfStock || busy}
                className="flex md:hidden items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm active:scale-95 disabled:opacity-50"
              >
                <ShoppingCart className="size-3" />
                <span>افزودن</span>
              </button>
            </div>

            {outOfStock ? (
              <span className="text-[11px] text-destructive font-bold mt-1">ناموجود در انبار</span>
            ) : null}
            {!outOfStock && (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5 ? (
              <span className="text-[10px] text-amber-600 font-bold mt-1">
                تنها {toFaDigits(product.stock ?? 0)} عدد در انبار باقی‌مانده!
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
