import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/store/SectionHeading";
import { productsQuery, type ProductQuery } from "@/lib/api/catalog";
import { useAddToCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  title: string;
  subtitle?: string;
  query?: ProductQuery;
  moreTo?: "/search" | "/offers" | "/categories";

  linkLabel?: string;
  rail?: boolean;
  tone?: "default" | "sale" | "best";
};

function ProductSectionSkeleton({ rail, title, subtitle, moreTo, linkLabel }: Partial<Props>) {
  return (
    <section className="container-page section-spacing opacity-50">
      <SectionHeading 
        title={title} 
        subtitle={subtitle} 
        moreHref={moreTo as string} 
        moreLabel={linkLabel}
        align="start"
      />
      <div className={rail ? "hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-8 md:mx-0 md:grid-products md:px-0 md:gap-6 lg:gap-8" : "grid-products"}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("aspect-[4/5] rounded-[14px] skeleton", rail ? "w-[220px] shrink-0 md:w-auto" : "")} />
        ))}
      </div>
    </section>
  );
}

export function ProductSection(props: Props) {
  return (
    <Suspense fallback={<ProductSectionSkeleton {...props} />}>
      <ProductSectionContent {...props} />
    </Suspense>
  );
}

function ProductSectionContent({
  id,
  title,
  subtitle,
  query = {},
  moreTo = "/search",
  linkLabel = "مشاهده همه",
  rail = false,
  tone = "default",
}: Props) {
  const { data: products } = useSuspenseQuery(productsQuery(query));
  const addToCart = useAddToCart();

  if (!products || products.length === 0) return null;

  return (
    <section id={id} className="container-page section-spacing">
      <SectionHeading 
        title={title} 
        subtitle={subtitle || ""} 
        moreHref={moreTo as string} 
        moreLabel={linkLabel}
        align="start"
      />

      <div className={rail ? "hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-8 md:mx-0 md:grid-products md:px-0 md:gap-6 lg:gap-8" : "grid-products"}>
        {products.map((product) => (
          <div key={product.id} className={rail ? "w-[220px] shrink-0 md:w-auto" : ""}>
            <ProductCard 
              product={product as any} 
            />

          </div>
        ))}
      </div>
    </section>
  );
}
