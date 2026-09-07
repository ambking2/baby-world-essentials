import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { HeroSlider } from "@/components/store/HeroSlider";
import { StoreShell } from "@/components/store/StoreShell";
import { ProductSection } from "@/components/site/ProductSection";
import { SectionHeading } from "@/components/store/SectionHeading";
import { BlogPreview } from "@/components/site/BlogPreview";

import { categoriesQuery, productsQuery } from "@/lib/api/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: (opts) =>
    Promise.all([
      opts.context.queryClient.ensureQueryData(categoriesQuery()),
      opts.context.queryClient.ensureQueryData(productsQuery({ tag: "new", limit: 4 })),
      opts.context.queryClient.ensureQueryData(productsQuery({ tag: "best", limit: 8 })),
    ]),
  component: HomePage,
});

// Multicolor gradient backgrounds for category cards (design system look)
const CATEGORY_GRADIENTS = [
  "linear-gradient(135deg, #FFE3F0 0%, #FFC7DE 100%)",
  "linear-gradient(135deg, #E3F0FF 0%, #C7DFFF 100%)",
  "linear-gradient(135deg, #E7FFE3 0%, #CFFFC7 100%)",
  "linear-gradient(135deg, #FFF3E3 0%, #FFE0C7 100%)",
  "linear-gradient(135deg, #F0E7FF 0%, #DDC7FF 100%)",
];

const CATEGORY_EMOJIS = ["🍼", "🧸", "👗", "🛏️", "🚗"];

function HomePage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery());

  return (
    <StoreShell>
      <HeroSlider />

      {/* Categories - Cloud Cards */}
      <section className="container-page section-spacing">
        <SectionHeading
          eyebrow="کالکشن‌های منتخب"
          title="جستجو بر اساس دسته‌بندی"
          moreHref="/search"
        />

        <div className="grid-categories">
          {categories.slice(0, 4).map((cat, idx) => (
            <Link
              key={cat.slug}
              to="/category/$slug"
              params={{ slug: cat.slug }}
              className="group relative overflow-hidden aspect-[4/5] rounded-[24px] shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              style={{ background: CATEGORY_GRADIENTS[idx % CATEGORY_GRADIENTS.length] }}
            >
              <img
                src={cat.image ?? "/images/cat-toys.jpg"}
                alt={cat.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                <div>
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-white/80">
                    {CATEGORY_EMOJIS[idx % CATEGORY_EMOJIS.length]} کالکشن
                  </span>
                  <h3 className="text-lg font-bold lg:text-xl">{cat.title}</h3>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:text-primary">
                  ←
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <div className="bg-secondary/30">
        <ProductSection
          title="جدیدترین‌های فصل"
          subtitle="مجموعه‌ای از بهترین کالاهای نوزادی با طراحی‌های مینیمال و کیفیت ساخت بی‌نظیر برای دلبند شما."
          query={{ tag: "new", limit: 4 }}
          moreTo="/search"
        />
      </div>

      {/* Editorial Split - Mission */}
      <section className="container-page section-spacing">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-32">
          <div className="relative aspect-square overflow-hidden rounded-[24px] bg-secondary lg:aspect-[4/5]">
            <img
              src="https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=1974&auto=format&fit=crop"
              alt="نوزاد و سیسمونی"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-border/50" />
          </div>
          <div className="max-w-lg">
            <span className="mb-6 block text-xs font-bold text-primary">ماموریت ما</span>
            <h2 className="mb-8 text-3xl font-bold leading-tight lg:text-5xl">همراه شما در زیباترین مسیر زندگی</h2>
            <p className="mb-10 text-base leading-relaxed text-muted-foreground lg:text-lg">
              در جهان کودک، ما معتقدیم هر نوزاد شایسته بهترین‌هاست. تمامی محصولات ما با دقت فراوان و با در نظر گرفتن سلامت و راحتی نوزاد انتخاب یا تولید می‌شوند؛ از کارگاه چوب اختصاصی تا برندهای معتبر جهانی.
            </p>
            <div className="flex flex-col gap-8 sm:flex-row">
              <div className="flex-1 rounded-2xl bg-surface-container-low p-5">
                <h4 className="mb-2 text-sm font-bold">تولید اختصاصی</h4>
                <p className="text-xs text-muted-foreground">ساخت سرویس خواب کودک در کارگاه مجهز ما با استانداردهای روز دنیا.</p>
              </div>
              <div className="flex-1 rounded-2xl bg-surface-container-low p-5">
                <h4 className="mb-2 text-sm font-bold">ارسال امن</h4>
                <p className="text-xs text-muted-foreground">بسته‌بندی تخصصی و ارسال سریع به سراسر ایران با ضمانت سلامت کالا.</p>
              </div>
            </div>
            <Link to="/about" className="btn-primary mt-12">بیشتر بدانید</Link>
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

      {/* Journal Section - Cloud Style */}
      <section className="bg-secondary/50 section-spacing">
        <div className="container-page">
          <div className="mb-12 text-center lg:mb-20">
            <span className="mb-4 block text-xs font-bold text-primary">مجله جهان کودک</span>
            <h2 className="text-3xl font-bold lg:text-5xl">راهنمای هوشمندانه برای والدین</h2>
          </div>
          <Suspense fallback={
            <div className="grid gap-8 md:grid-cols-3 lg:gap-16 opacity-50">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[16/10] rounded-[24px] skeleton" />
              ))}
            </div>
          }>
            <BlogPreview />
          </Suspense>
          <div className="mt-16 text-center">
            <Link to="/blog" className="btn-secondary">مشاهده همه مقالات</Link>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
