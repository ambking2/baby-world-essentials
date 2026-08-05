import { useSuspenseQuery } from "@tanstack/react-query";

import { StoreProductCard } from "@/components/store/StoreProductCard";
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
    <section id={id} className="container-page scroll-mt-28 py-12 md:py-16">
      <SectionHeading 
        title={title} 
        subtitle={subtitle || ""} 
        moreHref={moreTo as string} 
        moreLabel={linkLabel}
        align="center"
      />

      <div className={rail ? "hide-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 pb-8 md:mx-0 md:grid md:grid-cols-4 md:px-0" : "grid gap-8 sm:grid-cols-2 lg:grid-cols-4"}>
        {products.map((product) => (
          <div key={product.id} className={rail ? "w-[300px] shrink-0 md:w-auto" : ""}>
            <StoreProductCard 
              product={product as any} 
              onAddToCart={() => addToCart.mutate(product as any)}
              busy={addToCart.isPending && (addToCart.variables as any)?.id === product.id}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
