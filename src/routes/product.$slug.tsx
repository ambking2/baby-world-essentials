import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, Star } from "lucide-react";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGallery } from "@/components/site/ProductGallery";
import { ProductPurchase } from "@/components/site/ProductPurchase";
import { ProductTabs } from "@/components/site/ProductTabs";
import { ProductCard } from "@/components/site/ProductCard";
import { productQuery, relatedProductsQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";
import { discountPercent } from "@/types/catalog";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!product) throw notFound();
    void context.queryClient.ensureQueryData(relatedProductsQuery(params.slug, 5));
    return {
      title: product.title,
      brand: product.brand,
      image: product.image,
      sku: product.detail.sku,
      price: product.price,
      inStock: product.stock > 0,
      rating: product.rating,
      reviewCount: product.reviewCount,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "کالا یافت نشد | جهان کودک" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} | جهان کودک`;
    const description = `خرید ${loaderData.title} از برند ${loaderData.brand} در فروشگاه جهان کودک ابهر؛ پرداخت نقدی یا ۶ قسط ماهیانه، ضمانت اصالت کالا و ارسال به سراسر ایران.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: loaderData.title,
            sku: loaderData.sku,
            brand: { "@type": "Brand", name: loaderData.brand },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: loaderData.rating,
              reviewCount: loaderData.reviewCount,
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "IRT",
              price: loaderData.price,
              availability: loaderData.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          }),
        },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <Shell>
      <p role="alert" className="border border-border bg-card p-6 text-sm text-foreground">
        {error.message}
      </p>
    </Shell>
  ),
  notFoundComponent: () => (
    <Shell>
      <div className="border border-border bg-card p-8 text-center">
        <p className="text-sm text-foreground">این کالا در فروشگاه موجود نیست.</p>
        <Link to="/" className="mt-3 inline-block text-sm text-primary hover:underline">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </Shell>
  ),
  component: ProductPage,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container-page py-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const { data: related } = useSuspenseQuery(relatedProductsQuery(slug, 5));

  if (!product) return null;

  const off = discountPercent(product);
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <nav aria-label="مسیر صفحه" className="border-b border-border bg-card">
          <ol className="container-page flex flex-wrap items-center gap-1 py-2.5 text-[12px] text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">
                جهان کودک
              </Link>
            </li>
            <ChevronLeft className="size-3.5" aria-hidden="true" />
            <li>{product.categoryTitle}</li>
            <ChevronLeft className="size-3.5" aria-hidden="true" />
            <li className="text-foreground">{product.title}</li>
          </ol>
        </nav>

        <div className="container-page py-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5 border border-border bg-card p-4 md:grid-cols-2">
              <ProductGallery
                images={product.detail.gallery}
                alt={product.title}
                discount={off}
                outOfStock={outOfStock}
              />

              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  برند: <span className="text-foreground">{product.brand}</span>
                </p>
                <h1 className="text-lg font-bold leading-8 text-foreground md:text-xl">
                  {product.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-2.5 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-clay text-clay" aria-hidden="true" />
                    <span className="font-medium text-foreground">
                      {toFaDigits(product.rating.toFixed(1))}
                    </span>
                    ({toFaDigits(product.reviewCount)} نظر)
                  </span>
                  <span>
                    کد کالا: <span className="text-foreground">{product.detail.sku}</span>
                  </span>
                  <span className={outOfStock ? "text-sale" : "text-primary"}>
                    {outOfStock ? "ناموجود" : "موجود در انبار"}
                  </span>
                </div>

                <ul className="space-y-1.5">
                  {product.detail.highlights.map((item) => (
                    <li key={item} className="flex gap-2 text-[13px] leading-6 text-muted-foreground">
                      <span className="mt-2.5 size-1.5 shrink-0 bg-primary" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>

                {product.madeInWorkshop ? (
                  <p className="mt-auto border border-border bg-secondary px-3 py-2 text-[12px] leading-6 text-foreground">
                    ساخت کارگاه خودمان در ابهر؛ امکان سفارش ابعاد و رنگ دلخواه با تماس تلفنی
                    ۰۲۴-۳۵۲۲-۳۳۴۴.
                  </p>
                ) : null}
              </div>
            </div>

            <ProductPurchase product={product} />
          </div>

          <div className="mt-5">
            <ProductTabs product={product} />
          </div>

          {related.length > 0 ? (
            <section className="mt-8">
              <div className="flex items-end justify-between border-b border-border pb-2">
                <h2 className="text-base font-bold text-foreground">محصولات مرتبط</h2>
                <span className="text-[12px] text-muted-foreground">{product.categoryTitle}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                {related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
