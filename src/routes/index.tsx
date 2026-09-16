import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ArrowLeft, RefreshCcw, ShieldCheck, Sparkles, Truck, Users } from "lucide-react";

import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { ProductSection } from "@/components/site/ProductSection";
import { SectionHeading } from "@/components/store/SectionHeading";
import { BlogPreview } from "@/components/site/BlogPreview";
import { InstagramStrip } from "@/components/site/InstagramStrip";

import { getCatalogShell } from "@/server/functions/catalog";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const shellQuery = useQuery({
    queryKey: storeKeys.shell,
    queryFn: () => getCatalogShell(),
    staleTime: 5 * 60 * 1000,
  });
  const categories = shellQuery.data?.categories ?? [];

  return (
    <StoreShell>
      {/* Section 2 — HERO: 50/50 split دسکتاپ، تصویر بالا موبایل */}
      <section className="bg-background">
        <div className="mx-auto grid max-w-container-max items-center gap-8 px-margin-mobile pb-12 pt-8 md:grid-cols-2 md:gap-12 md:px-gutter md:pb-20 md:pt-12">
          {/* Copy */}
          <div className="order-2 fade-in-up md:order-1">
            <p className="mb-4 text-[12px] font-bold tracking-[0.2em] text-primary">
              کالکشن فصل جدید
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-6xl">
              لطافت بی‌پایان
              <br />
              <span className="italic text-primary">برای کوچک‌ترین عشق</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-8 text-zinc-600">
              سیسمونی و پوشاک نوزاد با پارچه‌های ارگانیک و دوخت کارگاه خودمان؛ انتخاب‌شده با وسواس
              برای اولین روزهای زندگی.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-[13px] font-bold text-white transition-colors duration-300 hover:bg-primary"
              >
                خرید کالکشن
              </Link>
              <Link
                to="/offers"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/70 px-8 py-3.5 text-[13px] font-bold text-foreground transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white"
              >
                تخفیف‌های ویژه
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 md:order-2">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src="/images/hero1.jpg"
                alt="کالکشن سیسمونی جهان کودک"
                className="aspect-[4/3] w-full object-cover md:aspect-[3/4]"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — CATEGORY STRIP: دایره‌ای، اسکرول افقی بدون اسکرول‌بار */}
      <section className="border-y border-zinc-100 bg-white">
        <div className="mx-auto max-w-container-max py-10 md:py-12">
          <h2 className="mb-6 text-center font-serif text-2xl font-bold text-foreground md:text-3xl">
            خرید بر اساس دسته
          </h2>
          <div className="hide-scrollbar -mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-2 md:justify-center md:mx-0 md:px-0">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="group flex w-20 shrink-0 snap-start flex-col items-center gap-3 md:w-24"
              >
                <span className="block aspect-square w-full overflow-hidden rounded-full border-2 border-transparent p-0.5 transition-all duration-300 group-hover:border-primary">
                  <img
                    src={cat.image ?? "/images/cat-toys.jpg"}
                    alt={cat.title}
                    loading="lazy"
                    className="h-full w-full rounded-full object-cover"
                  />
                </span>
                <span className="text-center text-[12px] font-medium text-zinc-600 transition-colors duration-300 group-hover:text-primary">
                  {cat.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Special offers — بنر سادهٔ برنز */}
      <section className="bg-background py-12 md:py-16">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-white md:p-12">
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.15em] text-white/80">
                  <Sparkles className="size-4" />
                  فروش ویژهٔ فصل
                </p>
                <h2 className="font-serif text-2xl font-bold leading-tight md:text-3xl">
                  پیشنهادهای ویژه
                </h2>
                <p className="mt-2 max-w-md text-sm leading-7 text-white/85">
                  تخفیف‌های زمان‌دار روی منتخب‌ترین کالاهای سیسمونی — تا پایان هفته.
                </p>
              </div>
              <Link
                to="/offers"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-foreground transition-colors duration-300 hover:bg-zinc-900 hover:text-white"
              >
                مشاهدهٔ تخفیف‌ها
                <ArrowLeft className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — FAVORITES GRID */}
      <div className="bg-surface-container-lowest">
        <ProductSection
          title="محبوب‌ترین‌ها"
          subtitle="انتخاب مادرها در این فصل"
          query={{ tag: "best", limit: 8 }}
          moreTo="/shop"
          linkLabel="مشاهدهٔ همه"
        />
      </div>

      {/* Section 5 — SPLIT BANNERS */}
      <section className="container-page py-section-gap">
        <div className="grid gap-6 lg:grid-cols-2">
          <Link
            to="/category/$slug"
            params={{ slug: "servis-khab" }}
            className="group relative flex h-[420px] items-end overflow-hidden rounded-2xl md:h-[600px]"
          >
            <img
              src="/images/cat-servis.jpg"
              alt="سرویس خواب نوزاد"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-zinc-900/10 to-transparent" />
            <div className="relative p-8 md:p-10">
              <p className="mb-2 text-[12px] font-bold tracking-[0.2em] text-white/80">
                سرویس خواب
              </p>
              <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">
                رویای اتاق نوزاد
              </h3>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                مشاهدهٔ سرویس خواب
              </span>
            </div>
          </Link>

          <Link
            to="/category/$slug"
            params={{ slug: "lebas" }}
            className="group relative flex h-[420px] items-end overflow-hidden rounded-2xl md:h-[600px]"
          >
            <img
              src="/images/cat-clothing.jpg"
              alt="پوشاک نوزاد"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-zinc-900/10 to-transparent" />
            <div className="relative p-8 md:p-10">
              <p className="mb-2 text-[12px] font-bold tracking-[0.2em] text-white/80">
                پوشاک نوزاد
              </p>
              <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">
                نرمِ نرم، ارگانیک
              </h3>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                مشاهدهٔ پوشاک
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-zinc-100 bg-white py-12 md:py-16">
        <div className="container-page grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "ضمانت اصالت کالا",
              body: "تضمین ۱۰۰٪ اصل بودن تمام محصولات",
            },
            { icon: Truck, title: "ارسال سریع", body: "تحویل ۲ تا ۵ روز کاری به سراسر ایران" },
            { icon: RefreshCcw, title: "بازگشت ۷ روزه", body: "مرجوعی آسان بدون قید و شرط" },
            { icon: Users, title: "مشاورهٔ واقعی", body: "کارشناسان سیسمونی در کنار شما" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center md:items-start md:text-start"
            >
              <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="size-6" />
              </span>
              <h3 className="font-serif text-base font-bold text-foreground">{item.title}</h3>
              <p className="mt-1 text-[13px] leading-6 text-zinc-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <div className="bg-surface-container-lowest">
        <ProductSection
          title="جدیدترین محصولات"
          subtitle="تازه‌رسیده‌های کالکشن فصل"
          query={{ tag: "new", limit: 8 }}
          moreTo="/shop"
          rail
        />
      </div>

      {/* Magazine preview */}
      <section className="bg-background py-section-gap">
        <div className="container-page">
          <SectionHeading
            title="مجلهٔ جهان کودک"
            moreHref="/blog"
            moreLabel="همهٔ مقالات"
            className="mb-12"
          />
          <Suspense
            fallback={
              <div className="grid gap-gutter opacity-50 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton aspect-[16/10] rounded-xl" />
                ))}
              </div>
            }
          >
            <BlogPreview />
          </Suspense>
        </div>
      </section>

      <InstagramStrip />
    </StoreShell>
  );
}
