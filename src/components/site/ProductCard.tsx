import { Hammer, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatToman, monthlyInstallment, toFaDigits } from "@/lib/format";
import type { Product } from "@/data/catalog";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]">
      <div className="relative overflow-hidden bg-sand">
        <img
          src={product.image}
          alt={product.title}
          width={900}
          height={900}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.badge ? (
          <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-primary">
            <Hammer className="size-3.5" aria-hidden="true" />
            {product.badge}
          </span>
        ) : null}
        {!product.inStock ? (
          <span className="absolute top-3 end-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-background">
            ناموجود
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <h3 className="text-sm leading-6 font-medium text-foreground">{product.title}</h3>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">{formatToman(product.price)}</span>
            <span className="text-xs text-muted-foreground">تومان</span>
            {product.oldPrice ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatToman(product.oldPrice)}
              </span>
            ) : null}
          </div>

          <p className="rounded-lg bg-installment px-3 py-2 text-xs text-installment-foreground">
            قسط ۶ ماهه از ماهی {formatToman(monthlyInstallment(product.price))} تومان
          </p>

          <Button className="w-full" disabled={!product.inStock}>
            <ShoppingBag data-icon="inline-start" aria-hidden="true" />
            {product.inStock ? "افزودن به سبد" : "اطلاع از موجود شدن"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            کد کالا: {toFaDigits(product.id.length * 137)}
          </p>
        </div>
      </div>
    </article>
  );
}
