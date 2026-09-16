import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Store } from "lucide-react";

import { StoreShell } from "@/components/store/StoreShell";
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
    <div role="alert" className="container-page py-20 text-center text-sm text-on-surface-variant">
      {String(error instanceof Error ? error.message : error)}
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-20 text-center text-on-surface-variant">یافت نشد</div>
  ),
});

function BrandsPage() {
  const { data: brands } = useSuspenseQuery(brandsQuery());

  return (
    <StoreShell>
      {/* Header band */}
      <section className="relative overflow-hidden bg-surface-container-low py-12 md:py-16">
        <div className="pointer-events-none absolute -left-16 -top-10 size-72 rounded-full bg-primary-fixed/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 size-64 rounded-full bg-tertiary-fixed/40 blur-3xl" />
        <div className="relative container-page">
          <nav className="mb-4 flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <Link to="/" className="transition-colors hover:text-primary">
              خانه
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-bold text-primary">برندها</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-surface-container-high bg-surface-container-lowest px-4 py-1.5 font-label-md text-label-md text-primary shadow-sm">
                <BadgeCheck className="size-4" />
                ضمانت اصالت کالا
              </span>
              <h1 className="font-display-lg text-display-lg-mobile font-extrabold tracking-tight text-on-surface md:text-display-lg">
                برندهای <span className="text-primary">جهان کودک</span>
              </h1>
              <p className="font-body-md text-body-md mt-3 max-w-2xl text-on-surface-variant">
                همه کالاها با فاکتور رسمی و ضمانت اصالت عرضه می‌شوند؛ از تولیدات کارگاه خودمان تا برندهای معتبر کالسکه، پوشاک و لوازم تغذیه.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
            >
              ورود به فروشگاه
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand cards */}
      <section className="container-page py-section-gap">
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <Link
              key={b.slug}
              to="/shop"
              className="group flex items-start gap-4 rounded-xl border border-surface-container-high bg-surface-container-lowest p-card-padding shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_12px_30px_rgba(0,75,209,0.12)]"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xl font-black text-on-primary-fixed transition-colors group-hover:bg-primary group-hover:text-on-primary">
                {b.title.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <h2 className="font-headline-sm text-headline-sm text-on-surface transition-colors group-hover:text-primary">
                  {b.title}
                </h2>
                <p className="mt-1 text-[13px] leading-6 text-on-surface-variant">{b.note}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  <Store className="size-3.5" />
                  محصولات این برند
                  <ArrowLeft className="size-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </StoreShell>
  );
}
