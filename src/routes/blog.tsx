import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { postsQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

const title = "مجله جهان کودک | راهنمای خرید سیسمونی";
const description =
  "یادداشت‌های فروشگاه جهان کودک درباره انتخاب سرویس خواب، چک‌لیست سیسمونی و نگهداری از لوازم نوزاد.";

export const Route = createFileRoute("/blog")({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery()),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://baby-world-essentials.lovable.app/blog" },
    ],
    links: [{ rel: "canonical", href: "https://baby-world-essentials.lovable.app/blog" }],
  }),
  component: BlogPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="container-page py-20 text-center text-sm">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="container-page py-20 text-center">یافت نشد</div>,
});

function BlogPage() {
  const { data: posts } = useSuspenseQuery(postsQuery());

  return (
    <SiteLayout>
      <PageHeader
        title="مجله فروشگاه"
        description="چیزهایی که در فروشگاه بارها از ما پرسیده می‌شود، اینجا نوشته‌ایم."
        crumbs={[{ label: "مجله" }]}
      />
      <div className="container-page grid gap-4 py-8 md:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.slug}
            className="flex flex-col rounded-2xl border border-border bg-card p-6"
          >
            <p className="text-[11px] text-muted-foreground">
              {p.date} — {toFaDigits(p.readMinutes)} دقیقه مطالعه
            </p>
            <h2 className="mt-2 text-base font-bold leading-7 text-foreground">
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:text-primary">
                {p.title}
              </Link>
            </h2>
            <p className="mt-2 flex-1 text-[13px] leading-7 text-muted-foreground">{p.excerpt}</p>
            <Link
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="mt-4 text-xs font-medium text-primary hover:underline"
            >
              ادامه مطلب
            </Link>
          </article>
        ))}
      </div>
    </SiteLayout>
  );
}
