import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { ProductGrid } from "@/components/site/ProductGrid";
import { ProductRail } from "@/components/site/ProductRail";
import { productsQuery, type ProductQuery } from "@/lib/api/catalog";

type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  query?: ProductQuery;
  moreTo?: "/shop" | "/offers" | "/categories";
  linkLabel?: string;
  /** Horizontal scroll rail on mobile instead of a 2-column grid. */
  rail?: boolean;
  tone?: "default" | "sale";
};

export function ProductSection({
  id,
  title,
  subtitle,
  query = {},
  moreTo = "/shop",
  linkLabel = "مشاهده همه",
  rail = false,
  tone = "default",
}: Props) {
  const { data: products } = useSuspenseQuery(productsQuery(query));

  if (products.length === 0) return null;

  return (
    <section id={id} className="container-page scroll-mt-28 py-6 md:py-10">
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:mb-5 md:items-end">
        <div className="min-w-0">
          <h2
            className={
              tone === "sale"
                ? "truncate text-lg font-black text-sale md:text-xl"
                : "truncate text-lg font-black text-foreground md:text-xl"
            }
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground md:mt-1 md:text-xs">
              {subtitle}
            </p>
          ) : null}
        </div>
        <Link
          to={moreTo}
          className="flex shrink-0 items-center gap-0.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-primary hover:bg-secondary/70"
        >
          {linkLabel}
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {rail ? <ProductRail products={products} /> : <ProductGrid products={products} />}
    </section>
  );
}
