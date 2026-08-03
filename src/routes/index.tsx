import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PromoBanner } from "@/components/site/PromoBanner";
import { CategoryStrip } from "@/components/site/CategoryStrip";
import { ProductSection } from "@/components/site/ProductSection";
import { TrustBar } from "@/components/site/TrustBar";
import { CustomerTrust } from "@/components/site/CustomerTrust";
import { categoriesQuery, productsQuery } from "@/lib/api/catalog";

const title = "جهان کودک | فروشگاه اینترنتی سیسمونی و اتاق کودک";
const description =
  "خرید سیسمونی نوزاد از فروشگاه جهان کودک ابهر: سرویس خواب چوبی، کالسکه، لباس، اسباب‌بازی و لوازم تغذیه. پرداخت قسطی ۶ ماهه و ارسال به سراسر ایران.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(categoriesQuery());
    void context.queryClient.ensureQueryData(productsQuery({ tag: "offer", limit: 5 }));
    void context.queryClient.ensureQueryData(productsQuery({ tag: "featured", limit: 5 }));
    void context.queryClient.ensureQueryData(productsQuery({ tag: "new", limit: 5 }));
    void context.queryClient.ensureQueryData(productsQuery({ tag: "best", limit: 5 }));
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PromoBanner />
        <CategoryStrip />
        <ProductSection
          id="offers"
          title="پیشنهاد ویژه این هفته"
          subtitle="تا پایان موجودی انبار"
          query={{ tag: "offer", limit: 5 }}
        />
        <div id="trust" className="scroll-mt-24">
          <TrustBar />
        </div>
        <ProductSection
          id="new"
          title="جدیدترین کالاها"
          subtitle="تازه‌ رسیده‌های این ماه"
          query={{ tag: "new", limit: 5 }}
        />
        <ProductSection
          id="best"
          title="پرفروش‌ترین‌ها"
          subtitle="بیشترین خرید مشتریان فروشگاه"
          query={{ tag: "best", limit: 5 }}
        />
      </main>
      <Footer />
    </div>
  );
}
