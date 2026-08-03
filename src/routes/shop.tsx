import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductGrid } from "@/components/site/ProductGrid";
import { productsQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

const title = "فروشگاه | همه کالاهای سیسمونی جهان کودک";
const description =
  "فهرست کامل کالاهای فروشگاه جهان کودک ابهر: سرویس خواب، کالسکه، پوشاک نوزاد، اسباب‌بازی چوبی و لوازم تغذیه با ارسال به سراسر ایران.";

export const Route = createFileRoute("/shop")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
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

  return (
    <SiteLayout>
      <PageHeader
        title="همه کالاها"
        description="کالاهای موجود در انبار فروشگاه ابهر. برای موجودی رنگ یا سایز خاص تماس بگیرید."
        crumbs={[{ label: "فروشگاه" }]}
      />
      <div className="container-page py-8">
        <p className="mb-5 text-xs text-muted-foreground">
          {toFaDigits(products.length)} کالا
        </p>
        <ProductGrid products={products} />
      </div>
    </SiteLayout>
  );
}
