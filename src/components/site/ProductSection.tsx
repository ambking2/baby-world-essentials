import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { ProductGrid } from "@/components/site/ProductGrid";
import { productsQuery, type ProductQuery } from "@/lib/api/catalog";

type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  query?: ProductQuery;
  moreTo?: "/shop" | "/offers" | "/categories";
  linkLabel?: string;
};

export function ProductSection({
  id,
  title,
  subtitle,
  query = {},
  moreTo = "/shop",
  linkLabel = "مشاهده همه",
}: Props) {
  const { data: products } = useSuspenseQuery(productsQuery(query));

  if (products.length === 0) return null;

  return (
    <section id={id} className="container-page scroll-mt-28 py-8 md:py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-foreground md:text-xl">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <Link
          to={moreTo}
          className="flex shrink-0 items-center gap-0.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-primary hover:bg-secondary/70"
        >
          {linkLabel}
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <ProductGrid products={products} />
    </section>
  );
}
