import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star, Truck } from "lucide-react";
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
    <div className={cn(
      "group relative flex h-full flex-col bg-white border border-border rounded-[14px] transition-all duration-300 hover:-translate-y-1 hover:shadow-soft",
      className
    )}>
      {/* Image Container - 4:5 Ratio */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[14px] bg-[#F9F9F9]">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={product.image || product.cover || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop"}
            alt={product.title}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
              outOfStock && "opacity-60"
            )}
          />
        </Link>
        
        {/* Badges - Premium style */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {off > 0 && !outOfStock && (
            <span className="bg-destructive text-white px-2 py-1 text-[10px] font-bold rounded-md shadow-sm">
              {toFaDigits(off)}٪ تخفیف
            </span>
          )}
          {product.tags?.includes("new") && (
            <span className="bg-primary text-white px-2 py-1 text-[10px] font-bold rounded-md shadow-sm">
              جدید
            </span>
          )}
          {product.tags?.includes("best-seller") && (
            <span className="bg-amber-100 text-amber-800 px-2 py-1 text-[10px] font-bold rounded-md border border-amber-200">
              پرفروش
            </span>
          )}
        </div>

        {/* Wishlist Button - Minimal */}
        <button 
          onClick={() => onToggleWishlist ? onToggleWishlist(product) : toast.success("به علاقه‌مندی‌ها اضافه شد")}
          className="absolute right-4 top-4 p-2 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
        >
          <Heart className={cn("size-4", inWishlist && "fill-destructive text-destructive")} />
        </button>

        {/* Quick Add - Hover only */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={() => onAddToCart ? onAddToCart(product) : toast.success("به سبد خرید اضافه شد")}
            disabled={outOfStock}
            className="w-full bg-white/95 backdrop-blur-sm text-gray-900 border border-border py-2.5 text-[11px] font-bold rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
          >
            {outOfStock ? "ناموجود" : "افزودن سریع"}
          </button>
        </div>
      </div>

      {/* Info Container - Comfortable Padding */}
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="mb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          {product.brand || "جهان کودک"}
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
                <Star key={i} className={cn("size-3", i <= (product.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">({toFaDigits(product.reviewCount || 0)})</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-gray-900">
                  {formatToman(product.price || product.effectivePrice)}
                </span>
                {product.oldPrice && (
                  <span className="text-[12px] text-muted-foreground line-through opacity-60">
                    {formatToman(product.oldPrice)}
                  </span>
                )}
              </div>
              
              {!outOfStock && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <Truck className="size-3" />
                  <span>ارسال رایگان</span>
                </div>
              )}
            </div>
            
            {outOfStock && (
              <span className="text-[11px] text-destructive font-bold mt-1">ناموجود در انبار</span>
            )}
            {!outOfStock && product.stock <= 5 && (
              <span className="text-[10px] text-amber-600 font-bold mt-1">تنها {toFaDigits(product.stock)} عدد در انبار باقی‌مانده!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}