import { Link } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatToman, monthlyInstallment, toFaDigits } from "@/lib/format";
import { discountPercent, type Product } from "@/types/catalog";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 4;

  return (
    <article className="group relative flex h-full flex-col border border-border bg-card p-3 transition-colors hover:border-primary/40">
      <Link to="/" className="relative block bg-sand">
        <img
          src={product.image}
          alt={product.title}
          width={600}
          height={600}
          loading="lazy"
          className={cn("aspect-square w-full object-cover", outOfStock && "opacity-60 grayscale")}
        />
        {off > 0 && !outOfStock ? (
          <span className="absolute top-2 start-2 bg-sale px-1.5 py-0.5 text-xs font-bold text-sale-foreground">
            ٪{toFaDigits(off)}
          </span>
        ) : null}
        {outOfStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/75 py-1 text-center text-xs font-medium text-background">
            ناموجود
          </span>
        ) : null}
      </Link>

      <div className="mt-3 flex flex-1 flex-col gap-1.5">
        <p className="text-[11px] text-muted-foreground">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-10 text-[13px] leading-5 text-foreground">
          <Link to="/" className="hover:text-primary">
            {product.title}
          </Link>
        </h3>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="size-3.5 fill-clay text-clay" aria-hidden="true" />
          {toFaDigits(product.rating.toFixed(1))}
          <span>({toFaDigits(product.reviewCount)} نظر)</span>
        </div>

        <div className="mt-auto pt-2">
          {product.oldPrice ? (
            <span className="block text-xs text-muted-foreground line-through">
              {formatToman(product.oldPrice)}
            </span>
          ) : (
            <span className="block text-xs text-transparent select-none">‌</span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-foreground">{formatToman(product.price)}</span>
            <span className="text-[11px] text-muted-foreground">تومان</span>
          </div>
          <p className="mt-1 text-[11px] text-installment-foreground">
            ۶ قسط ماهیانه {formatToman(monthlyInstallment(product.price))} تومان
          </p>

          {lowStock ? (
            <p className="mt-1 text-[11px] font-medium text-sale">
              تنها {toFaDigits(product.stock)} عدد در انبار
            </p>
          ) : null}

          <Button
            size="sm"
            className="mt-2 w-full rounded-md"
            variant={outOfStock ? "outline" : "default"}
            disabled={outOfStock}
          >
            <ShoppingCart data-icon="inline-start" aria-hidden="true" />
            {outOfStock ? "ناموجود" : "افزودن به سبد"}
          </Button>
        </div>
      </div>
    </article>
  );
}
