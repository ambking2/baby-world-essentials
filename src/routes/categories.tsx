import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { AgeStrip } from "@/components/site/AgeStrip";
import { ageGroupsQuery, categoriesQuery } from "@/lib/api/catalog";

const title = "دسته‌بندی کالاها | جهان کودک";
const description =
  "دسته‌بندی کالاهای فروشگاه جهان کودک: سرویس خواب، کالسکه و کریر، پوشاک نوزاد، اسباب‌بازی چوبی، شیردهی و دکور اتاق کودک.";

export const Route = createFileRoute("/categories")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(categoriesQuery());
    void context.queryClient.ensureQueryData(ageGroupsQuery());
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baby-world-essentials.lovable.app/categories" },
    ],
    links: [{ rel: "canonical", href: "https://baby-world-essentials.lovable.app/categories" }],
  }),
  component: CategoriesPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="container-page py-20 text-center">یافت نشد</div>,
});

function CategoriesPage() {
  return (
    <SiteLayout>
      <PageHeader
        title="دسته‌بندی کالاها"
        description="کالاها را بر اساس نوع یا سن کودک مرور کنید."
        crumbs={[{ label: "دسته‌بندی‌ها" }]}
      />
      <div className="container-page py-8">
        <CategoryGrid />
      </div>
      <AgeStrip />
    </SiteLayout>
  );
}
