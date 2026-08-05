import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { SiteHeader } from "@/components/store/SiteHeader";
import { HeroSlider } from "@/components/store/HeroSlider";
import { StoreShell } from "@/components/store/StoreShell";
import { ProductSection } from "@/components/site/ProductSection";
import { BlogPreview } from "@/components/site/BlogPreview";
import { business } from "@/data/business";
import { categoriesQuery } from "@/lib/api/catalog";
import { getHomeProducts } from "@/server/functions/products";
import { queryOptions } from "@tanstack/react-query";
import { toFaDigits } from "@/lib/format";

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

  return (
    <StoreShell>
      <HeroSlider />

      {/* Categories Grid - High End Editorial Style */}
      <section className="container-page py-20 lg:py-32">
        <div className="mb-12 flex items-end justify-between lg:mb-20">
          <div className="max-w-xl">
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-primary">کالکشن‌های منتخب</span>
            <h2 className="text-3xl font-bold lg:text-5xl">جستجو بر اساس دسته‌بندی</h2>
          </div>
          <Link to="/search" className="group flex items-center gap-2 text-sm font-bold transition-premium hover:text-primary">
            مشاهده همه
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
          {categories.slice(0, 4).map((cat, idx) => (
            <Link 
              key={cat.slug} 
              to="/category/$slug" 
              params={{ slug: cat.slug }}
              className={cn(
                "group relative overflow-hidden aspect-[4/5] bg-secondary",
                idx % 2 === 1 ? "mt-8 lg:mt-12" : ""
              )}
            >
              <img 
                src={cat.image ?? "/images/cat-toys.jpg"} 
                alt={cat.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="text-xl font-bold">{cat.title}</h3>
                <p className="mt-1 text-xs opacity-80">{toFaDigits(Math.floor(Math.random() * 50) + 10)} محصول</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Collection Section */}
      <div className="bg-secondary/30">
        <ProductSection 
          title="جدیدترین‌های فصل" 
          subtitle="مجموعه‌ای از بهترین کالاهای نوزادی با طراحی‌های مینیمال و کیفیت ساخت بی‌نظیر برای دلبند شما."
          query={{ tag: "new", limit: 4 }} 
          moreTo="/search" 
        />
      </div>

      {/* Editorial Split Section */}
      <section className="container-page py-20 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="relative aspect-square overflow-hidden bg-secondary lg:aspect-[4/5]">
            <img 
              src="/images/hero-nursery.jpg" 
              alt="نوزاد و سیسمونی" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="max-w-lg">
            <span className="mb-6 block text-xs font-bold uppercase tracking-widest text-primary">ماموریت ما</span>
            <h2 className="mb-8 text-3xl font-bold leading-tight lg:text-5xl">همراه شما در زیباترین مسیر زندگی</h2>
            <p className="mb-10 text-base leading-relaxed text-muted-foreground lg:text-lg">
              در جهان کودک، ما معتقدیم هر نوزاد شایسته بهترین‌هاست. به همین دلیل تمامی محصولات ما با دقت فراوان و با در نظر گرفتن سلامت و راحتی نوزاد انتخاب یا تولید می‌شوند. از کارگاه چوب اختصاصی تا برندهای معتبر جهانی.
            </p>
            <div className="flex flex-col gap-8 sm:flex-row">
              <div className="flex-1">
                <h4 className="mb-2 text-sm font-bold uppercase tracking-wide">تولید اختصاصی</h4>
                <p className="text-xs text-muted-foreground">ساخت سرویس خواب کودک در کارگاه مجهز ما با استانداردهای روز دنیا.</p>
              </div>
              <div className="flex-1">
                <h4 className="mb-2 text-sm font-bold uppercase tracking-wide">ارسال امن</h4>
                <p className="text-xs text-muted-foreground">بسته‌بندی تخصصی و ارسال سریع به سراسر ایران با ضمانت سلامت کالا.</p>
              </div>
            </div>
            <Link to="/about" className="btn-primary mt-12 inline-block">بیشتر بدانید</Link>
          </div>
        </div>
      </section>

      {/* Best Sellers Rail */}
      <ProductSection 
        title="محبوب‌ترین‌ها" 
        subtitle="کالاهایی که بیشترین رضایت مشتریان را به همراه داشته‌اند."
        query={{ tag: "best", limit: 8 }} 
        rail 
      />

      {/* Journal Section */}
      <section className="bg-secondary/50 py-20 lg:py-32">
        <div className="container-page">
          <div className="mb-12 text-center lg:mb-20">
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-primary">مجله جهان کودک</span>
            <h2 className="text-3xl font-bold lg:text-5xl">راهنمای هوشمندانه برای والدین</h2>
          </div>
          <BlogPreview />
          <div className="mt-16 text-center">
            <Link to="/blog" className="btn-secondary">مشاهده همه مقالات</Link>
          </div>
        </div>
      </section>

      {/* Trust Badges - Clean & Minimal */}
      <section className="border-t border-border py-20 lg:py-32">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-12 text-center md:grid-cols-4">
            <div>
              <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full bg-secondary">
                <Heart className="size-6 text-primary" />
              </div>
              <h4 className="mb-2 text-sm font-bold uppercase tracking-wide">اصالت کالا</h4>
              <p className="text-xs text-muted-foreground">تضمین ۱۰۰٪ کیفیت محصولات</p>
            </div>
            <div>
              <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full bg-secondary">
                <Truck className="size-6 text-primary" />
              </div>
              <h4 className="mb-2 text-sm font-bold uppercase tracking-wide">ارسال سریع</h4>
              <p className="text-xs text-muted-foreground">به تمام نقاط ایران</p>
            </div>
            <div>
              <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full bg-secondary">
                <ShieldCheck className="size-6 text-primary" />
              </div>
              <h4 className="mb-2 text-sm font-bold uppercase tracking-wide">پرداخت امن</h4>
              <p className="text-xs text-muted-foreground">درگاه‌های معتبر بانکی</p>
            </div>
            <div>
              <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full bg-secondary">
                <Headphones className="size-6 text-primary" />
              </div>
              <h4 className="mb-2 text-sm font-bold uppercase tracking-wide">پشتیبانی ۲۴/۷</h4>
              <p className="text-xs text-muted-foreground">همیشه پاسخگوی شما هستیم</p>
            </div>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}

import { cn } from "@/lib/utils";
import { Headphones, Heart, ShieldCheck, Truck } from "lucide-react";
