import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Hero } from "@/components/site/Hero";
import { AgeStrip } from "@/components/site/AgeStrip";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { ProductSection } from "@/components/site/ProductSection";
import { PromoTiles } from "@/components/site/PromoTiles";
import { TrustSection } from "@/components/site/TrustSection";
import { CustomerReviews } from "@/components/site/CustomerReviews";
import { InstagramStrip } from "@/components/site/InstagramStrip";
import { Newsletter } from "@/components/site/Newsletter";
import { ageGroupsQuery, categoriesQuery, productsQuery } from "@/lib/api/catalog";

const title = "جهان کودک | فروشگاه اینترنتی سیسمونی و اتاق کودک";
const description =
  "خرید سیسمونی نوزاد از فروشگاه جهان کودک ابهر: سرویس خواب چوبی، کالسکه، لباس، اسباب‌بازی و لوازم تغذیه. پرداخت قسطی ۶ ماهه و ارسال به سراسر ایران.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(categoriesQuery());
    void context.queryClient.ensureQueryData(ageGroupsQuery());
    void context.queryClient.ensureQueryData(productsQuery({ tag: "new", limit: 4 }));
    void context.queryClient.ensureQueryData(productsQuery({ tag: "offer", limit: 8 }));
    void context.queryClient.ensureQueryData(productsQuery({ tag: "best", limit: 4 }));
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baby-world-essentials.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://baby-world-essentials.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "فروشگاه جهان کودک",
          telephone: "+982435223344",
          address: {
            "@type": "PostalAddress",
            streetAddress: "خیابان طالقانی، روبه‌روی بانک ملت، پلاک ۱۴۲",
            addressLocality: "ابهر",
            addressRegion: "زنجان",
            addressCountry: "IR",
          },
          openingHours: "Sa-Th 09:00-21:00",
        }),
      },
    ],
  }),
  component: Home,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
});

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <AgeStrip />
      <ProductSection
        id="new"
        title="تازه‌رسیده‌ها"
        subtitle="کالاهای اضافه‌شده در دو هفته گذشته"
        query={{ tag: "new", limit: 4 }}
      />
      <PromoTiles />
      <section className="container-page py-8">
        <div className="mb-5">
          <h2 className="text-lg font-black text-foreground md:text-xl">دسته‌بندی کالاها</h2>
          <p className="mt-1 text-xs text-muted-foreground">همه چیز برای اتاق و روزمرگی نوزاد</p>
        </div>
        <CategoryGrid />
      </section>
      <ProductSection
        id="offers"
        title="پیشنهاد ویژه این هفته"
        subtitle="تا پایان موجودی انبار"
        query={{ tag: "offer", limit: 8 }}
        moreTo="/offers"
      />
      <TrustSection />
      <ProductSection
        id="best"
        title="پرفروش‌ترین‌ها"
        subtitle="بیشترین خرید مشتریان فروشگاه"
        query={{ tag: "best", limit: 4 }}
      />
      <CustomerReviews />
      <InstagramStrip />
      <Newsletter />
    </SiteLayout>
  );
}
