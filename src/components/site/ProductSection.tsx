import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import useEmblaCarousel from "embla-carousel-react";

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
  moreTo?: string;

  linkLabel?: string;
  rail?: boolean;
  hideHeading?: boolean;
  tone?: "default" | "sale" | "best";
};

function ProductSectionSkeleton({ rail, title, subtitle, moreTo, linkLabel }: Partial<Props>) {
  return (
    <section className="container-page section-spacing opacity-50">
      <SectionHeading
        title={title ?? ""}
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
  hideHeading = false,
  tone = "default",
}: Props) {
  const { data: products } = useSuspenseQuery(productsQuery(query));
  const addToCart = useAddToCart();

  if (!products || products.length === 0) return null;

  return (
    <section id={id} className="container-page section-spacing overflow-x-clip">
      {!hideHeading && (
        <SectionHeading
          title={title}
          subtitle={subtitle}
          moreHref={moreTo as string}
          moreLabel={linkLabel}
          align="start"
        />
      )}

      {rail ? (
        <>
          {/* موبایل: کاروسل نامحدود تک‌لاینی؛ دسکتاپ: گرید چهارستونه */}
          <MobileProductLoop products={products} onAdd={addToCart} />
          <div className="hidden md:grid md:grid-products md:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product as any}
                onAddToCart={(p) => addToCart.mutate(p as any)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="grid-products">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product as any}
              onAddToCart={(p) => addToCart.mutate(p as any)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** کاروسل نامحدود تک‌لاینی محصولات — فقط موبایل (زیر md). */
function MobileProductLoop({
  products,
  onAdd,
}: {
  products: Array<any>;
  onAdd: ReturnType<typeof useAddToCart>;
}) {
  const [emblaRef] = useEmblaCarousel({
    loop: products.length >= 2,
    direction: "rtl",
    align: "start",
    slidesToScroll: 1,
  });

  return (
    <div ref={emblaRef} className="overflow-hidden py-2 md:hidden">
      <div className="-mr-3 flex touch-pan-y">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative min-w-0 shrink-0 grow-0 basis-[34%] pl-3"
          >
            <ProductCard product={product} onAddToCart={(p) => onAdd.mutate(p as any)} />
          </div>
        ))}
      </div>
    </div>
  );
}
