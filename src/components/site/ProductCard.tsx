import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatToman, monthlyInstallment, toFaDigits } from "@/lib/format";
import { discountPercent, type Product } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 4;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lift">
      <div className="relative bg-secondary/50 p-3">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
          <img
            src={product.image}
            alt={product.title}
            width={600}
            height={600}
            loading="lazy"
            className={cn(
              "aspect-square w-full rounded-xl object-cover",
              outOfStock && "opacity-60 grayscale",
            )}
          />
        </Link>

        {off > 0 && !outOfStock ? (
          <span className="absolute top-4 start-4 rounded-full bg-sale px-2 py-0.5 text-[11px] font-bold text-sale-foreground">
            ٪{toFaDigits(off)} تخفیف
          </span>
        ) : null}

        <button
          type="button"
          aria-label="افزودن به علاقه‌مندی‌ها"
          onClick={() => toast.success("به علاقه‌مندی‌ها اضافه شد")}
          className="absolute top-4 end-4 grid size-8 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-soft transition-colors hover:text-accent"
        >
          <Heart className="size-4" aria-hidden="true" />
        </button>

        {outOfStock ? (
          <span className="absolute inset-x-3 bottom-3 rounded-lg bg-foreground/80 py-1 text-center text-xs font-medium text-background">
            ناموجود
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 pt-2">
        <p className="text-[11px] text-primary">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-10 text-[13px] font-medium leading-5 text-foreground">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">
            {product.title}
          </Link>
        </h3>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="size-3.5 fill-sun text-sun" aria-hidden="true" />
          {toFaDigits(product.rating.toFixed(1))}
          <span>({toFaDigits(product.reviewCount)} نظر)</span>
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-foreground">
              {formatToman(product.price)}
            </span>
            <span className="text-[11px] text-muted-foreground">تومان</span>
            {product.oldPrice ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatToman(product.oldPrice)}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-[11px] text-installment-foreground">
            ۶ قسط ماهیانه {formatToman(monthlyInstallment(product.price))} تومان
          </p>

          <p
            className={cn(
              "mt-1 text-[11px] font-medium",
              lowStock ? "text-sale" : outOfStock ? "text-muted-foreground" : "text-primary",
            )}
          >
            {outOfStock
              ? "موجود نیست"
              : lowStock
                ? `تنها ${toFaDigits(product.stock)} عدد در انبار`
                : "موجود در انبار"}
          </p>

          <Button
            size="sm"
            className="mt-2.5 w-full rounded-full"
            variant={outOfStock ? "outline" : "default"}
            disabled={outOfStock}
            onClick={() => toast.success("کالا به سبد خرید اضافه شد")}
          >
            <ShoppingCart data-icon="inline-start" aria-hidden="true" />
            {outOfStock ? "ناموجود" : "افزودن به سبد"}
          </Button>
        </div>
      </div>
    </article>
  );
}
