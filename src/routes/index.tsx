import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
  ArrowLeft,
  BadgePercent,
  Gift,
  HeartHandshake,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  Truck,
} from "lucide-react";

import { HeroSlider } from "@/components/store/HeroSlider";
import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { ProductSection } from "@/components/site/ProductSection";
import { SectionHeading } from "@/components/store/SectionHeading";
import { BlogPreview } from "@/components/site/BlogPreview";
import { AgeStrip } from "@/components/site/AgeStrip";
import { InstagramStrip } from "@/components/site/InstagramStrip";

import { getCatalogShell } from "@/server/functions/catalog";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const shellQuery = useQuery({
    queryKey: storeKeys.shell,
    queryFn: () => getCatalogShell(),
    staleTime: 5 * 60 * 1000,
  });
  const categories = shellQuery.data?.categories ?? [];

  return (
    <StoreShell>
      {/* Hero */}
      <HeroSlider />

      {/* Shop by age — circular chips (design-system tertiary accent) */}
      <Suspense fallback={<div className="container-page py-10"><div className="skeleton mx-auto h-40 w-full max-w-3xl rounded-2xl" /></div>}>
        <AgeStrip />
      </Suspense>

      {/* Popular categories */}
      <section className="bg-surface-container-lowest py-section-gap">
        <div className="container-page">
          <div className="mb-12 text-center">
            <h2 className="font-headline-md text-headline-md mb-2 text-primary">دسته‌بندی‌های محبوب</h2>
            <p className="font-label-md text-label-md text-on-surface-variant">
              مسیر خرید را از میان کالکشن‌های منتخب انتخاب کنید
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {[...categories, ...(categories[0] ? [categories[0]] : [])].slice(0, 6).map((cat, idx) => (
              <Link
                key={`${cat.slug}-${idx}`}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="group flex flex-col items-center rounded-2xl bg-surface-container-low p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-primary-fixed"
              >
                <span className="mb-3 flex size-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md transition-transform group-hover:scale-105">
                  <img src={cat.image ?? "/images/cat-toys.jpg"} alt={cat.title} className="h-full w-full object-cover" loading="lazy" />
                </span>
                <span className="font-label-md text-label-md text-on-surface">{cat.title}</span>
                <span className="mt-1 text-[11px] text-on-surface-variant">{cat.productCount ? `${cat.productCount} کالا` : ""}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Special offers — dark gradient banner strip */}
      <section className="bg-background py-10 md:py-16">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary to-primary-container p-8 text-on-primary md:p-12">
            <div className="pointer-events-none absolute -left-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-14 left-1/3 size-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold backdrop-blur-md">
                  <Timer className="size-3.5" />
                  فروش ویژهٔ فصل
                </span>
                <h2 className="font-display-lg text-2xl font-black leading-tight drop-shadow-sm md:text-3xl">
                  پیشنهادهای ویژه
                </h2>
                <p className="mt-2 max-w-md text-sm leading-7 text-white/85">
                  تخفیف‌های زمان‌دار روی منتخب‌ترین کالاهای سیسمونی — تا پایان هفته.
                </p>
              </div>
              <Link
                to="/offers"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-primary shadow-xl transition-transform hover:scale-105 active:scale-95"
              >
                مشاهدهٔ تخفیف‌ها
                <ArrowLeft className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <div className="bg-surface-container-lowest">
        <ProductSection
          title="جدیدترین محصولات"
          subtitle="تازه‌رسیده‌های کالکشن فصل با کیفیت تضمینی."
          query={{ tag: "new", limit: 8 }}
          moreTo="/shop"
          rail
        />
      </div>

      {/* Promo banners: main + two side */}
      <section className="container-page py-section-gap">
        <div className="grid gap-gutter lg:grid-cols-[2fr_1fr]">
          <Link
            to="/category/$slug"
            params={{ slug: "servis-khab" }}
            className="group relative overflow-hidden rounded-2xl bg-surface-container-low p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lift md:p-12"
          >
            <div className="pointer-events-none absolute -left-8 -top-8 size-40 rounded-full bg-primary-fixed/60" />
            <div className="relative max-w-md">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-tertiary-fixed px-4 py-1.5 text-xs font-bold text-on-tertiary-fixed-variant">
                <Gift className="size-3.5" />
                طرح خوش‌آمد
              </span>
              <h2 className="font-display-lg text-display-lg-mobile md:text-headline-md mb-4 font-black text-on-surface">
                ۱۵٪ تخفیف برای اولین خرید
              </h2>
              <p className="text-sm leading-7 text-on-surface-variant">
                با کد JOSE1404 روی اولین سفارش؛ شامل سرویس خواب و کالکشن ارگانیک.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                شروع خرید
                <ArrowLeft className="size-4" />
              </span>
            </div>
          </Link>

          <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-1">
            <Link
              to="/category/$slug"
              params={{ slug: "lebas" }}
              className="group relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
                <Sparkles className="size-5" />
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">پوشاک ارگانیک</h3>
              <p className="mt-1 text-[13px] leading-6 text-on-surface-variant">نخ پنبهٔ ۱۰۰٪ برای پوست حساس نوزاد.</p>
              <BadgePercent className="absolute left-4 top-4 size-6 text-secondary-container" />
            </Link>
            <Link
              to="/category/$slug"
              params={{ slug: "kalaskeh" }}
              className="group relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-primary-fixed text-primary">
                <Rocket className="size-5" />
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">لوازم حمل و نقل</h3>
              <p className="mt-1 text-[13px] leading-6 text-on-surface-variant">کالسکه و کریر با استاندارد ایمنی اروپا.</p>
              <Truck className="absolute left-4 top-4 size-6 text-primary-fixed-dim" />
            </Link>
          </div>
        </div>
      </section>

      {/* Best sellers grid */}
      <section className="bg-surface-container-low py-section-gap">
        <div className="container-page">
          <h2 className="font-headline-md text-headline-md mb-12 text-center text-primary">
            پرطرفدارترین‌های این هفته
          </h2>
          <ProductSection
            title=""
            query={{ tag: "best", limit: 4 }}
            moreTo="/shop"
            hideHeading
          />
        </div>
      </section>

      {/* Trust strip */}
      <section className="container-page py-section-gap">
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "ضمانت اصالت کالا", body: "تضمین ۱۰۰٪ اصل بودن تمام محصولات" },
            { icon: Truck, title: "ارسال سریع", body: "تحویل ۲ تا ۵ روز کاری به سراسر ایران" },
            { icon: HeartHandshake, title: "بازگشت ۷ روزه", body: " مرجوعی آسان بدون قید و شرط" },
            { icon: Star, title: "مشاورهٔ واقعی", body: "کارشناسان سیسمونی در کنار شما" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-card-padding shadow-sm"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
                <item.icon className="size-6" />
              </span>
              <div>
                <h3 className="font-label-md text-label-md font-bold text-on-surface">{item.title}</h3>
                <p className="mt-1 text-[13px] leading-6 text-on-surface-variant">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Magazine preview */}
      <section className="bg-surface-container-lowest py-section-gap">
        <div className="container-page">
          <SectionHeading
            title="مجلهٔ جهان کودک | راهنمای رشد و شادی دلبندان"
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

      {/* Instagram */}
      <InstagramStrip />

      {/* Newsletter banner */}
      <section className="container-page pb-section-gap">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-container p-8 text-on-primary text-center md:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 size-52 rounded-full bg-white/10 blur-3xl" />
          <h2 className="font-headline-md text-headline-md relative font-black text-white">
            از جدیدترین تخفیف‌ها باخبر شوید
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm leading-7 text-white/85">
            ایمیل خود را ثبت کنید تا کالاهای تازه‌رسیده و قیمت‌های ویژه را زودتر از همه ببینید.
          </p>
          <Link
            to="/contact"
            className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-primary shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            عضویت در خبرنامه
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </section>
    </StoreShell>
  );
}
