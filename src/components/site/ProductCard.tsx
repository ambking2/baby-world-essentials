import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { formatToman, toFaDigits } from "@/lib/format";
import { discountPercent } from "@/types/catalog";
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
    <div className={cn("group flex h-full flex-col bg-white border border-border rounded-xl transition-all duration-300 hover:shadow-lg", className)}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={product.image || product.cover || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop"}
            alt={product.title}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
              outOfStock && "opacity-60"
            )}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {off > 0 && !outOfStock && (
            <span className="bg-white px-2 py-0.5 text-[10px] font-bold text-gray-900 border border-gray-100 rounded-sm shadow-sm">
              ٪{toFaDigits(off || 0)} تخفیف
            </span>
          )}
          {product.tags?.includes("new") && (
            <span className="bg-primary text-white px-2 py-0.5 text-[10px] font-bold rounded-sm shadow-sm">
              جدید
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={() => onToggleWishlist ? onToggleWishlist(product) : toast.success("به علاقه‌مندی‌ها اضافه شد")}
          className="absolute right-3 top-3 p-1.5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full transition-all duration-300"
        >
          <Heart className={cn("size-4 text-gray-600 hover:text-primary hover:fill-primary", inWishlist && "fill-primary text-primary")} />
        </button>
      </div>

      {/* Info Container */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-[11px] font-medium text-gray-400 uppercase tracking-widest">
          {product.brand}
        </div>
        
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className="mb-2 text-sm font-semibold leading-snug text-gray-900 transition-colors hover:text-primary line-clamp-2">
            {product.title}
          </h3>
        </Link>
        
        <div className="mt-auto">
          <div className="flex items-center gap-1 mb-1">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] text-gray-500 font-medium">{toFaDigits(product.rating || 5)}</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-gray-900">
              {formatToman(product.price || product.effectivePrice)}
            </span>
            {product.oldPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatToman(product.oldPrice)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart ? onAddToCart(product) : toast.success("به سبد خرید اضافه شد")}
            disabled={outOfStock}
            className="mt-3 flex w-full items-center justify-center gap-2 border border-gray-900 py-2 text-[11px] font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-sm"
          >
            <ShoppingCart className="size-3" />
            {outOfStock ? "ناموجود" : (busy ? "در حال افزودن..." : "افزودن به سبد")}
          </button>
        </div>
      </div>
    </div>
  );
}