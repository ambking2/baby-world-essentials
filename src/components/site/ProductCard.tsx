import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { formatToman, toFaDigits } from "@/lib/format";
import { discountPercent, type Product } from "@/types/catalog";
import { cn } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-0.5" aria-label={`امتیاز ${rating} از ۵`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            "size-3.5",
            i <= Math.round(rating) ? "fill-sun text-sun" : "fill-border text-border",
          )}
        />
      ))}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;
  const isNew = product.tags.includes("new");

  return (
    <article className="group flex h-full flex-col text-center">
      <div className="relative overflow-hidden rounded-2xl bg-secondary/60">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
          <img
            src={product.image}
            alt={product.title}
            width={600}
            height={600}
            loading="lazy"
            className={cn(
              "aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]",
              outOfStock && "opacity-60 grayscale",
            )}
          />
        </Link>

        {/* badges */}
        <div className="pointer-events-none absolute top-2 start-2 flex flex-col gap-1">
          {off > 0 && !outOfStock ? (
            <span className="grid size-11 place-items-center rounded-full bg-sale text-[11px] font-black leading-none text-sale-foreground shadow-soft">
              ٪{toFaDigits(off)}
            </span>
          ) : null}
          {isNew ? (
            <span className="grid size-11 place-items-center rounded-full bg-sky text-[11px] font-black leading-none text-foreground shadow-soft">
              جدید
            </span>
          ) : null}
          {outOfStock ? (
            <span className="grid size-11 place-items-center rounded-full bg-muted-foreground/90 text-[10px] font-bold leading-none text-background">
              ناموجود
            </span>
          ) : null}
        </div>

        {/* hover action overlay (KidsPlay style) */}
        {!outOfStock ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 bg-primary/90 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
            <button
              type="button"
              aria-label={`افزودن ${product.title} به سبد خرید`}
              onClick={() => toast.success("کالا به سبد خرید اضافه شد")}
              className="grid size-12 place-items-center rounded-full border-2 border-primary-foreground/80 text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary"
            >
              <ShoppingCart className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`افزودن ${product.title} به علاقه‌مندی‌ها`}
              onClick={() => toast.success("به علاقه‌مندی‌ها اضافه شد")}
              className="grid size-12 place-items-center rounded-full border-2 border-primary-foreground/80 text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary"
            >
              <Heart className="size-5" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center gap-1.5 px-1 pt-3">
        <p className="text-[11px] text-muted-foreground">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-10 text-[13px] font-bold leading-5 text-foreground">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">
            {product.title}
          </Link>
        </h3>

        <div className="mt-auto flex flex-wrap items-baseline justify-center gap-2 pt-1">
          {product.oldPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatToman(product.oldPrice)}
            </span>
          ) : null}
          <span className="text-[15px] font-black text-primary md:text-base">
            {formatToman(product.price)}
          </span>
          <span className="text-[11px] text-muted-foreground">تومان</span>
        </div>

        <Stars rating={product.rating} />
      </div>
    </article>
  );
}
