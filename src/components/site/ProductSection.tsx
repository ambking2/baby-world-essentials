import { useSuspenseQuery } from "@tanstack/react-query";

import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/store/SectionHeading";
import { productsQuery, type ProductQuery } from "@/lib/api/catalog";
import { useAddToCart } from "@/hooks/use-cart";

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

export function ProductSection({
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

  if (products.length === 0) return null;

  return (
    <section id={id} className="container-page section-spacing">
      <SectionHeading 
        title={title} 
        subtitle={subtitle || ""} 
        moreHref={moreTo as string} 
        moreLabel={linkLabel}
        align="start"
      />

      <div className={rail ? "hide-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 pb-8 md:mx-0 md:grid-products md:px-0" : "grid-products"}>
        {products.map((product) => (
          <div key={product.id} className={rail ? "w-[300px] shrink-0 md:w-auto" : ""}>
            <ProductCard 
              product={product as any} 
            />

          </div>
        ))}
      </div>
    </section>
  );
}
