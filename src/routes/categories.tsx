import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Grid3x3 } from "lucide-react";

import { StoreShell } from "@/components/store/StoreShell";
import { categoriesQuery } from "@/lib/api/catalog";

const title = "دسته‌بندی کالاها | جهان کودک";
const description =
  "دسته‌بندی کالاهای فروشگاه جهان کودک: سرویس خواب، کالسکه و کریر، پوشاک نوزاد، اسباب‌بازی چوبی، شیردهی و دکور اتاق کودک.";

export const Route = createFileRoute("/categories")({
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery()),
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
    <div role="alert" className="container-page py-20 text-center text-sm text-on-surface-variant">
      {String(error instanceof Error ? error.message : error)}
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-20 text-center text-on-surface-variant">یافت نشد</div>
  ),
});

function CategoriesPage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery());

  return (
    <StoreShell>
      {/* Header band */}
      <section className="relative overflow-hidden bg-surface-container-low py-12 md:py-16">
        <div className="pointer-events-none absolute -right-16 -top-10 size-72 rounded-full bg-secondary-fixed/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 size-64 rounded-full bg-primary-fixed/50 blur-3xl" />
        <div className="relative container-page">
          <nav className="mb-4 flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <Link to="/" className="transition-colors hover:text-primary">
              خانه
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-bold text-primary">دسته‌بندی‌ها</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-surface-container-high bg-surface-container-lowest px-4 py-1.5 font-label-md text-label-md text-primary shadow-sm">
                <Grid3x3 className="size-4" />
                {categories.length} دسته‌بندی فعال
              </span>
              <h1 className="font-display-lg text-display-lg-mobile font-extrabold tracking-tight text-on-surface md:text-display-lg">
                دسته‌بندی <span className="text-primary">کالاها</span>
              </h1>
              <p className="font-body-md text-body-md mt-3 max-w-2xl text-on-surface-variant">
                از سرویس خواب و کالسکه تا پوشاک ارگانیک و اسباب‌بازی آموزشی — مسیر خریدتان را از همین‌جا انتخاب کنید.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
            >
              مشاهدهٔ همه کالاها
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="container-page py-section-gap">
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,75,209,0.12)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
                <img
                  src={c.image}
                  alt={c.title}
                  width={400}
                  height={400}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-[11px] font-bold text-primary shadow-sm backdrop-blur-sm">
                  خرید
                </span>
              </div>
              <div className="p-card-padding">
                <h2 className="font-headline-sm text-headline-sm text-on-surface transition-colors group-hover:text-primary">
                  {c.title}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-on-surface-variant">{c.note}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </StoreShell>
  );
}
