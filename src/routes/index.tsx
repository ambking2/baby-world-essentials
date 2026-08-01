import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { Installment } from "@/components/site/Installment";
import { Workshop } from "@/components/site/Workshop";
import { StoreVisit } from "@/components/site/StoreVisit";
import { Faq, faqs } from "@/components/site/Faq";

const title = "سیسمونی جهان کودک ابهر | خرید سیسمونی نوزاد و سرویس خواب چوبی";
const description =
  "فروش سیسمونی کامل نوزاد در ابهر: سرویس خواب چوبی ساخت کارگاه خودمان، کالسکه، لباس، اسباب‌بازی و لوازم تغذیه. خرید نقدی یا اقساط ۶ ماهه.";

export const Route = createFileRoute("/")({
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
          "@graph": [
            {
              "@type": "Store",
              name: "سیسمونی جهان کودک",
              image: "https://jahankoodak.ir/og.jpg",
              telephone: "+982435223344",
              address: {
                "@type": "PostalAddress",
                streetAddress: "خیابان طالقانی، روبه‌روی بانک ملت، پلاک ۱۴۲",
                addressLocality: "ابهر",
                addressRegion: "زنجان",
                addressCountry: "IR",
              },
              openingHours: "Sa-Th 09:00-21:00",
            },
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <Installment />
        <Workshop />
        <StoreVisit />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
