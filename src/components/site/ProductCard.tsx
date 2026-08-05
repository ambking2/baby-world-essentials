import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { formatToman, toFaDigits } from "@/lib/format";
import { discountPercent, type Product } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function ProductCard({ 
  product, 
  className,
  inWishlist,
  busy,
  onAddToCart,
  onToggleWishlist
}: { 
  product: any; 
  className?: string;
  inWishlist?: boolean;
  busy?: boolean;
  onAddToCart?: (product: any) => void;
  onToggleWishlist?: (product: any) => void;
}) {

  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;

  return (
    <div className={cn("group flex h-full flex-col bg-white border border-transparent hover:border-border transition-premium", className)}>
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={product.image || product.cover || "/images/cat-toys.jpg"}
            alt={product.title}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
              outOfStock && "opacity-60"
            )}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          {off > 0 && !outOfStock && (
            <span className="bg-destructive px-2 py-1 text-[10px] font-bold text-white uppercase tracking-tight">
              ٪{toFaDigits(off || 0)} تخفیف
            </span>
          )}
          {product.tags.includes("new") && (
            <span className="bg-primary px-2 py-1 text-[10px] font-bold text-white uppercase tracking-tight">
              جدید
            </span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full flex-col gap-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={() => onAddToCart ? onAddToCart(product) : toast.success("به سبد خرید اضافه شد")}
            disabled={outOfStock}
            className="flex w-full items-center justify-center gap-2 bg-white py-2.5 text-xs font-bold text-foreground shadow-sm transition-premium hover:bg-foreground hover:text-white"
          >
            <ShoppingCart className="size-4" />
            {busy ? "در حال افزودن..." : "افزودن به سبد"}
          </button>
        </div>
        
        {/* Wishlist Button */}
        <button 
          onClick={() => onToggleWishlist ? onToggleWishlist(product) : toast.success("به علاقه‌مندی‌ها اضافه شد")}
          className="absolute left-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <Heart className={cn("size-5 text-foreground hover:fill-foreground", inWishlist && "fill-foreground")} />
        </button>
      </div>

      {/* Info Container */}
      <div className="flex flex-1 flex-col pt-4">
        <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
          <span>{product.brand}</span>
          <div className="flex items-center gap-0.5">
            <Star className="size-3 fill-primary text-primary" />
            <span>{toFaDigits(product.rating)}</span>
          </div>
        </div>
        
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className="mb-2 text-sm font-medium leading-tight text-foreground transition-colors hover:text-primary">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">
            {formatToman(product.price || product.effectivePrice)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatToman(product.oldPrice)}
            </span>
          )}
        </div>

        {product.ratingAverage > 0 && (
          <div className="mt-2 flex items-center gap-0.5">
            <Star className="size-3 fill-primary text-primary" />
            <span className="text-[10px] text-muted-foreground">{toFaDigits(product.ratingAverage.toFixed(1))}</span>
          </div>
        )}

        {outOfStock && (
          <p className="mt-2 text-[11px] font-bold text-destructive">ناموجود در انبار</p>
        )}
      </div>
    </div>
  );
}
