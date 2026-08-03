import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductGrid } from "@/components/site/ProductGrid";
import { ShopSidebar } from "@/components/site/ShopSidebar";
import { categoriesQuery, productsQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

const title = "فروشگاه | همه کالاهای سیسمونی جهان کودک";
const description =
  "فهرست کامل کالاهای فروشگاه جهان کودک ابهر: سرویس خواب، کالسکه، پوشاک نوزاد، اسباب‌بازی چوبی و لوازم تغذیه با ارسال به سراسر ایران.";

export const Route = createFileRoute("/shop")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productsQuery());
    await context.queryClient.ensureQueryData(categoriesQuery());
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baby-world-essentials.lovable.app/shop" },
    ],
    links: [{ rel: "canonical", href: "https://baby-world-essentials.lovable.app/shop" }],
  }),
  component: ShopPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="container-page py-20 text-center">یافت نشد</div>,
});

function ShopPage() {
  const { data: products } = useSuspenseQuery(productsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <SiteLayout>
      <PageHeader
        title="همه کالاها"
        description="کالاهای موجود در انبار فروشگاه ابهر. برای موجودی رنگ یا سایز خاص تماس بگیرید."
        crumbs={[{ label: "فروشگاه" }]}
      />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
        <ShopSidebar categories={categories} topRated={topRated} />
        <div>
          <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
            <p className="text-sm font-black text-foreground">
              {toFaDigits(products.length)} کالا یافت شد
            </p>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              مرتب‌سازی
              <select className="rounded-full border border-border bg-card px-3 py-1.5 text-xs outline-none">
                <option>پیش‌فرض فروشگاه</option>
                <option>ارزان‌ترین</option>
                <option>گران‌ترین</option>
                <option>پرفروش‌ترین</option>
              </select>
            </label>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
    </SiteLayout>
  );
}
