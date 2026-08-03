import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductGrid } from "@/components/site/ProductGrid";
import { productsQuery } from "@/lib/api/catalog";

const title = "تخفیف‌های این هفته | جهان کودک";
const description =
  "کالاهای تخفیف‌دار فروشگاه جهان کودک ابهر؛ قیمت ویژه تا پایان موجودی انبار.";

export const Route = createFileRoute("/offers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery({ tag: "offer" })),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baby-world-essentials.lovable.app/offers" },
    ],
    links: [{ rel: "canonical", href: "https://baby-world-essentials.lovable.app/offers" }],
  }),
  component: OffersPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="container-page py-20 text-center">یافت نشد</div>,
});

function OffersPage() {
  const { data: products } = useSuspenseQuery(productsQuery({ tag: "offer" }));

  return (
    <SiteLayout>
      <PageHeader
        title="تخفیف‌های این هفته"
        description="قیمت‌ها تا پایان موجودی انبار معتبر است."
        crumbs={[{ label: "تخفیف‌ها" }]}
      />
      <div className="container-page py-8">
        <ProductGrid products={products} />
      </div>
    </SiteLayout>
  );
}
