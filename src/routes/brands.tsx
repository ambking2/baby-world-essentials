import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { brandsQuery } from "@/lib/api/catalog";

const title = "برندهای موجود در جهان کودک";
const description =
  "برندهایی که در فروشگاه جهان کودک ابهر عرضه می‌شوند؛ از تولیدات کارگاه خودمان تا کالسکه، پوشاک و لوازم تغذیه.";

export const Route = createFileRoute("/brands")({
  loader: ({ context }) => context.queryClient.ensureQueryData(brandsQuery()),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baby-world-essentials.lovable.app/brands" },
    ],
    links: [{ rel: "canonical", href: "https://baby-world-essentials.lovable.app/brands" }],
  }),
  component: BrandsPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="container-page py-20 text-center">یافت نشد</div>,
});

function BrandsPage() {
  const { data: brands } = useSuspenseQuery(brandsQuery());

  return (
    <SiteLayout>
      <PageHeader
        title="برندها"
        description="همه کالاها با فاکتور رسمی و ضمانت اصالت عرضه می‌شوند."
        crumbs={[{ label: "برندها" }]}
      />
      <div className="container-page grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <Link
            key={b.slug}
            to="/shop"
            className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lift"
          >
            <span className="grid size-12 place-items-center rounded-full bg-secondary text-lg font-black text-primary">
              {b.title.slice(0, 1)}
            </span>
            <p className="mt-4 text-sm font-bold text-foreground">{b.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{b.note}</p>
          </Link>
        ))}
      </div>
    </SiteLayout>
  );
}
