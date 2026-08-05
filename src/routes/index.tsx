import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpLeft, Flame, HeartHandshake, WandSparkles } from "lucide-react";
import { useRef } from "react";

import { CategoryStrip } from "@/components/store/CategoryStrip";
import { HeroSlider } from "@/components/store/HeroSlider";
import { StoreShell } from "@/components/store/StoreShell";
import { TrustBadges } from "@/components/store/TrustBadges";
import { ProductSection } from "@/components/site/ProductSection";
import { SpecialPowers } from "@/components/site/SpecialPowers";
import { BlogPreview } from "@/components/site/BlogPreview";
import { AboutCompany } from "@/components/site/AboutCompany";
import { business } from "@/data/business";
import { categoriesQuery, productsQuery } from "@/lib/api/catalog";
import { getHomeProducts } from "@/server/functions/products";

import { toFaDigits } from "@/lib/format";
import type { ProductCard } from "@/server/repo/products";
import { queryOptions } from "@tanstack/react-query";

const homeProductsQuery = () => queryOptions({
  queryKey: ["home-products"],
  queryFn: () => getHomeProducts(),
});

export const Route = createFileRoute("/")({
  loader: (opts) => Promise.all([
    opts.context.queryClient.ensureQueryData(homeProductsQuery()),
    opts.context.queryClient.ensureQueryData(categoriesQuery()),
  ]),
  component: HomePage,
});

function HomePage() {
  const { data: products } = useSuspenseQuery(homeProductsQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const workshopRef = useRef<HTMLElement | null>(null);

  return (
    <StoreShell>
      <HeroSlider />

      <div className="-mt-12 relative z-10 pt-12 zigzag-top bg-white">
        <TrustBadges />
      </div>

      <ProductSection 
        title="حراج شگفت‌انگیز امروز" 
        subtitle="تخفیف‌های واقعی برای سیسمونی و پوشاک که فقط تا پایان هفته اعتبار دارند"
        query={{ tag: "offer", limit: 8 }} 
        moreTo="/offers" 
        rail 
        tone="sale" 
      />

      {categories && categories.length > 0 ? <CategoryStrip categories={categories as any} /> : null}

      <section className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="storybook-panel candy-surface rounded-[3.5rem] p-8 shadow-deep md:p-12 ring-1 ring-white/40">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-extrabold text-brand shadow-soft">
              <HeartHandshake className="size-3.5" aria-hidden />
              تجربه‌ی خرید انسانی‌تر
            </div>
            <h2 className="max-w-xl text-2xl font-black leading-[1.35] text-foreground md:text-[2.25rem]">
              فروشگاه خشک و بی‌روح نه؛ خریدی که حس یک فروشگاه واقعی، گرم و قابل‌اعتماد را بدهد.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-muted-foreground">
              از انتخاب سرویس خواب تا لباس، کالسکه و اسباب‌بازی، همه‌چیز را طوری چیده‌ایم که کاربر مسیر را گم نکند و راحت‌تر به خرید برسد.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/search" className="toy-button rounded-full bg-gradient-to-r from-brand to-sale px-8 py-3.5 text-sm font-extrabold text-primary-foreground shadow-lift">
                شروع خرید سیسمونی
              </Link>
              <Link to="/about" className="rounded-full border-2 border-white/70 bg-white/85 px-8 py-3.5 text-sm font-bold text-foreground shadow-soft transition-all hover:border-brand hover:text-brand">
                داستان جهان کودک
              </Link>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[3rem] border-2 border-white/90 bg-gradient-to-br from-[#fff2de] to-[#fffbf5] p-8 shadow-lift transition-all duration-500 hover:scale-[1.03] hover:shadow-deep group">
              <div className="mb-4 inline-flex rounded-full bg-white px-4 py-1.5 text-[11px] font-extrabold text-sale shadow-soft">
                حراج فعال
              </div>
              <h3 className="text-xl font-black text-foreground">تخفیف‌های واقعی، نه نمایشی</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">محصولات تخفیف‌دار را جدا و واضح نشان می‌دهیم تا تصمیم خرید سریع‌تر و واقعی‌تر شود.</p>
              <Link to="/offers" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand transition-all hover:gap-3">
                مشاهده همه تخفیف‌ها
                <ArrowUpLeft className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="rounded-[3rem] border-2 border-white/90 bg-gradient-to-br from-[#ebf5ff] to-[#faffff] p-8 shadow-lift transition-all duration-500 hover:scale-[1.03] hover:shadow-deep group">
              <div className="mb-4 inline-flex rounded-full bg-white px-4 py-1.5 text-[11px] font-extrabold text-brand shadow-soft">
                تولید کارگاه
              </div>
              <h3 className="text-xl font-black text-foreground">سفارشی‌سازی برای خانواده‌ها</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">رنگ، ابعاد و حال‌وهوای دکور را می‌توان با نیاز واقعی اتاق کودک هماهنگ کرد.</p>
              <Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand transition-all hover:gap-3">
                ثبت سفارش ساخت در کارگاه
                <ArrowUpLeft className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ProductSection 
        title="پرفروش‌ترین‌های جهان کودک" 
        subtitle="انتخاب اول مادران ابهری در ماه گذشته؛ با تضمین کیفیت و دوام"
        query={{ tag: "best", limit: 8 }} 
        rail 
      />

      <SpecialPowers />

      <ProductSection 
        title="تازه‌رسیده‌های فروشگاه" 
        subtitle="جدیدترین مدل‌های لباس نوزادی و کالاهای کارگاه که همین امروز موجود شدند"
        query={{ tag: "new", limit: 8 }} 
        rail 
      />

      <BlogPreview />

      <ProductSection 
        title="منتخب ویترین جهان کودک" 
        subtitle="کالاهایی که ما به خاطر کیفیت ساخت و طراحی عالی‌شان به شما توصیه می‌کنیم"
        query={{ tag: "featured", limit: 8 }} 
      />

      <AboutCompany />
    </StoreShell>
  );
}
