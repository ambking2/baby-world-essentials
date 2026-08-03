import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery, type ProductQuery } from "@/lib/api/catalog";

type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  query?: ProductQuery;
  linkLabel?: string;
};

export function ProductSection({ id, title, subtitle, query = {}, linkLabel = "مشاهده همه" }: Props) {
  const { data: products } = useSuspenseQuery(productsQuery(query));

  if (products.length === 0) return null;

  return (
    <section id={id} className="container-page scroll-mt-24 py-8">
      <div className="flex items-end justify-between border-b border-border pb-3">
        <div>
          <h2 className="text-base font-bold text-foreground md:text-lg">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <a
          href="#categories"
          className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          {linkLabel}
          <ChevronLeft className="size-4" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
