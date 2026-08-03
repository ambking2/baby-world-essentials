import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { postsQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

const title = "مجله جهان کودک | راهنمای خرید سیسمونی";
const description =
  "یادداشت‌های فروشگاه جهان کودک درباره انتخاب سرویس خواب، چک‌لیست سیسمونی و نگهداری از لوازم نوزاد.";

export const Route = createFileRoute("/blog/")({
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
        tone="sky"
        title="مجله فروشگاه"
        description="چیزهایی که در فروشگاه بارها از ما پرسیده می‌شود، اینجا نوشته‌ایم."
        crumbs={[{ label: "مجله" }]}
      />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-8">
          {posts.map((p) => (
            <article key={p.slug} className="border-b border-border pb-8 last:border-0">
              <p className="text-center text-[11px] tracking-widest text-muted-foreground">
                مجله جهان کودک
              </p>
              <h2 className="mt-1 text-center text-lg font-black leading-8 text-foreground md:text-xl">
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:text-primary">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                نوشته {p.author} — {p.date} — {toFaDigits(p.readMinutes)} دقیقه مطالعه
              </p>
              <p className="mt-4 text-sm leading-8 text-muted-foreground">{p.excerpt}</p>
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="mt-4 inline-block text-xs font-black tracking-widest text-primary hover:underline"
              >
                ادامه مطلب
              </Link>
            </article>
          ))}
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-black">آخرین مطلب‌ها</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {posts.slice(0, 4).map((p) => (
                <li key={p.slug}>
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="leading-6 text-muted-foreground hover:text-primary"
                  >
                    {p.title}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{p.date}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-black">خرید از فروشگاه</h2>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary">
                  همه کالاها
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-primary">
                  دسته‌بندی‌ها
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-muted-foreground hover:text-primary">
                  تخفیف‌های این هفته
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary">
                  آدرس فروشگاه ابهر
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </SiteLayout>
  );
}
