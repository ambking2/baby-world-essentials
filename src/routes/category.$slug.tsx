import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductGrid } from "@/components/site/ProductGrid";
import { categoriesQuery, productsQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ context, params }) => {
    const categories = await context.queryClient.ensureQueryData(categoriesQuery());
    const category = categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    void context.queryClient.ensureQueryData(productsQuery({ categorySlug: params.slug }));
    return { title: category.title, note: category.note };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "دسته‌بندی یافت نشد | جهان کودک" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} | فروشگاه جهان کودک`;
    const description = `خرید ${loaderData.title} (${loaderData.note}) از فروشگاه جهان کودک ابهر با ارسال به سراسر ایران.`;
    const url = `https://baby-world-essentials.lovable.app/category/${params.slug}`;
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
  component: CategoryPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <PageHeader title="این دسته‌بندی وجود ندارد" crumbs={[{ label: "دسته‌بندی‌ها", to: "/categories" }]} />
    </SiteLayout>
  ),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { title, note } = Route.useLoaderData();
  const { data: products } = useSuspenseQuery(productsQuery({ categorySlug: slug }));

  return (
    <SiteLayout>
      <PageHeader
        title={title}
        description={note}
        crumbs={[{ label: "دسته‌بندی‌ها", to: "/categories" }, { label: title }]}
      />
      <div className="container-page py-8">
        <p className="mb-5 text-xs text-muted-foreground">{toFaDigits(products.length)} کالا</p>
        <ProductGrid products={products} />
      </div>
    </SiteLayout>
  );
}
