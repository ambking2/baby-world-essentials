import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ChevronLeft, ChevronRight, Timer } from "lucide-react";

import { ProductCard } from "@/components/site/ProductCard";
import { useAddToCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { getProducts } from "@/server/functions/products";
import type { ProductCard as ProductCardData } from "@/server/repo/products";

/**
 * بنر «پیشنهادهای ویژه» صفحهٔ اصلی.
 *
 * متن و دکمه ثابت روی زمینهٔ آبی می‌مانند و محصولات تخفیف‌دار در یک اسلایدر
 * نامحدود (loop) با ورق زدنِ کارت‌به‌کارت پشتشان می‌چرخند.
 */
export function SpecialOffers() {
  const offersQuery = useQuery({
    queryKey: ["home", "special-offers"],
    queryFn: () => getProducts({ data: { onlyDiscounted: true, sort: "discount", perPage: 12 } }),
    staleTime: 5 * 60 * 1000,
  });
  const products = offersQuery.data?.items ?? [];

  return (
    <section className="bg-background py-10 md:py-16">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary to-primary-container p-6 text-on-primary md:p-10">
          <div className="pointer-events-none absolute -left-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 left-1/3 size-56 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-row items-stretch gap-4 md:gap-6 lg:gap-8">
            {/* متن و دکمه — راست (RTL start) */}
            <div className="w-[38%] shrink-0 self-center sm:w-[30%] lg:w-64 xl:w-72">
              <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold backdrop-blur-md sm:mb-3 sm:px-4 sm:text-xs">
                <Timer className="size-3.5" />
                فروش ویژهٔ فصل
              </span>
              <h2 className="font-display-lg text-lg font-black leading-tight text-white drop-shadow-sm sm:text-2xl md:text-3xl">
                پیشنهادهای ویژه
              </h2>
              <p className="mt-2 hidden text-sm leading-7 text-white/85 sm:block">
                تخفیف‌های زمان‌دار روی منتخب‌ترین کالاهای سیسمونی — تا پایان هفته.
              </p>
              <Link
                to="/offers"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-primary shadow-xl transition-transform hover:scale-105 active:scale-95 sm:mt-6 sm:px-8 sm:py-3.5 sm:text-sm"
              >
                مشاهدهٔ تخفیف‌ها
                <ArrowLeft className="size-4" />
              </Link>
            </div>

            {products.length > 0 ? (
              <OffersRail products={products} />
            ) : (
              <div className="min-w-0 flex-1 grid grid-cols-2 gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="skeleton aspect-square rounded-xl bg-white/30" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** اسلایدر نامحدود محصولات — هر بار یک کارت جابه‌جا می‌شود. */
function OffersRail({ products }: { products: Array<ProductCardData> }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: products.length >= 2,
    direction: "rtl",
    align: "start",
    slidesToScroll: 1,
  });
  const addToCart = useAddToCart();

  const arrowClass =
    "absolute top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-105 active:scale-90 md:size-11";

  return (
    <div className="relative min-w-0 flex-1">
      <div ref={emblaRef} className="-mx-2 overflow-hidden py-2">
        <div className="flex">
          {products.map((product) => (
            <div
              key={product.id}
              className={cn(
                "min-w-0 shrink-0 grow-0 px-2",
                "flex-[0_0_140px] sm:flex-[0_0_170px] md:flex-[0_0_190px] lg:flex-[0_0_220px] xl:flex-[0_0_240px]",
              )}
            >
              <ProductCard
                compact
                product={product}
                onAddToCart={(p) => addToCart.mutate(p as ProductCardData)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* فلش ورق زدن — در RTL دکمهٔ راست عقب و دکمهٔ چپ جلو است */}
      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="کارت قبلی"
        className={cn(arrowClass, "-right-2 md:-right-4")}
      >
        <ChevronRight className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="کارت بعدی"
        className={cn(arrowClass, "-left-2 md:-left-4")}
      >
        <ChevronLeft className="size-5" />
      </button>
    </div>
  );
}
