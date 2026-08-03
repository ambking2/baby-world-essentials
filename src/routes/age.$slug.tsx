import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductGrid } from "@/components/site/ProductGrid";
import { AgeStrip } from "@/components/site/AgeStrip";
import { ageGroupsQuery, productsByAgeQuery } from "@/lib/api/catalog";

export const Route = createFileRoute("/age/$slug")({
  loader: async ({ context, params }) => {
    const ages = await context.queryClient.ensureQueryData(ageGroupsQuery());
    const age = ages.find((a) => a.slug === params.slug);
    if (!age) throw notFound();
    void context.queryClient.ensureQueryData(productsByAgeQuery(params.slug));
    return { note: age.note };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "بازه سنی یافت نشد | جهان کودک" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `کالاهای مناسب ${loaderData.note} | جهان کودک`;
    const description = `کالاهای پیشنهادی فروشگاه جهان کودک برای کودکان ${loaderData.note}؛ پوشاک، اسباب‌بازی، خواب و تغذیه.`;
    const url = `https://baby-world-essentials.lovable.app/age/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: AgePage,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <PageHeader title="این بازه سنی وجود ندارد" crumbs={[{ label: "دسته‌بندی‌ها", to: "/categories" }]} />
    </SiteLayout>
  ),
});

function AgePage() {
  const { slug } = Route.useParams();
  const { note } = Route.useLoaderData();
  const { data: products } = useSuspenseQuery(productsByAgeQuery(slug));

  return (
    <SiteLayout>
      <PageHeader
        title={`کالاهای مناسب ${note}`}
        description="این فهرست بر اساس تجربه فروش حضوری فروشگاه مرتب شده است."
        crumbs={[{ label: "خرید بر اساس سن" }, { label: note }]}
      />
      <div className="container-page py-8">
        <ProductGrid products={products} />
      </div>
      <AgeStrip activeSlug={slug} />
    </SiteLayout>
  );
}
