import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpLeft, Flame, HeartHandshake, Sparkles, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import { CategoryStrip } from "@/components/store/CategoryStrip";
import { HeroSlider } from "@/components/store/HeroSlider";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SectionHeading } from "@/components/store/SectionHeading";
import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { TrustBadges } from "@/components/store/TrustBadges";
import { business } from "@/data/business";
import { useReveal } from "@/hooks/use-reveal";
import { toFaDigits } from "@/lib/format";
import { getCatalogShell } from "@/server/functions/catalog";
import { addCartItem } from "@/server/functions/cart";
import { getHomeProducts } from "@/server/functions/products";
import type { ProductCard } from "@/server/repo/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${business.name} | خرید اینترنتی سیسمونی و لوازم نوزاد` },
      {
        name: "description",
        content: `فروشگاه اینترنتی ${business.name}: تخت و سرویس خواب، لباس نوزاد، کالسکه، لوازم شیردهی و اسباب‌بازی با قیمت منصفانه.`,
      },
    ],
    links: [{ rel: "canonical", href: business.siteUrl }],
  }),
  component: HomePage,
});

function HomePage() {
  const queryClient = useQueryClient();
  const workshopRef = useReveal<HTMLDivElement>();

  const shellQuery = useQuery({
    queryKey: storeKeys.shell,
    queryFn: () => getCatalogShell(),
    staleTime: 5 * 60 * 1000,
  });

  const homeQuery = useQuery({
    queryKey: ["home-products"],
    queryFn: () => getHomeProducts(),
    staleTime: 60 * 1000,
  });

  const addToCart = useMutation({
    mutationFn: (product: ProductCard) => addCartItem({ data: { productId: product.id, qty: 1 } }),
    onSuccess: (result) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: storeKeys.cart });
    },
    onError: () => toast.error("افزودن به سبد انجام نشد؛ دوباره تلاش کنید."),
  });

  const data = homeQuery.data;
  const categories = shellQuery.data?.categories ?? [];
  const busyId = addToCart.isPending ? (addToCart.variables?.id ?? null) : null;

  const gridProps = {
    onAddToCart: (product: ProductCard) => addToCart.mutate(product),
    busyId,
  };

  return (
    <StoreShell>
      <HeroSlider />

      <div className="-mt-8 relative z-10 pt-8">
        <TrustBadges />
      </div>

      {categories.length > 0 ? <CategoryStrip categories={categories} /> : null}

      <section className="container-page py-4">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <div className="storybook-panel candy-surface rounded-[2.8rem] p-6 shadow-lift md:p-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-brand shadow-soft">
              <HeartHandshake className="size-3.5" aria-hidden />
              تجربه‌ی خرید انسانی‌تر
            </div>
            <h2 className="max-w-xl text-2xl font-black leading-[1.35] text-foreground md:text-[2rem]">
              فروشگاه خشک و بی‌روح نه؛ خریدی که حس یک فروشگاه واقعی، گرم و قابل‌اعتماد را بدهد.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-8 text-muted-foreground">
              از انتخاب سرویس خواب تا لباس، کالسکه و اسباب‌بازی، همه‌چیز را طوری چیده‌ایم که کاربر مسیر را گم نکند و راحت‌تر به خرید برسد.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/search" className="toy-button rounded-full bg-gradient-to-r from-brand to-sale px-6 py-3 text-sm font-extrabold text-primary-foreground">
                شروع خرید
              </Link>
              <Link to="/about" className="rounded-full border border-white/70 bg-white/85 px-5 py-3 text-sm font-bold text-foreground shadow-soft">
                داستان برند
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-[#fff0d8] to-[#fffaf2] p-5 shadow-soft transition-transform hover:scale-[1.02]">
              <div className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-sale shadow-soft">
                حراج فعال
              </div>
              <h3 className="text-lg font-black text-foreground">تخفیف‌های واقعی، نه نمایشی</h3>
              <p className="mt-2 text-xs leading-7 text-muted-foreground">محصولات تخفیف‌دار را جدا و واضح نشان می‌دهیم تا تصمیم خرید سریع‌تر و واقعی‌تر شود.</p>
              <Link to="/offers" className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-brand">
                مشاهده تخفیف‌ها
                <ArrowUpLeft className="size-3.5" aria-hidden />
              </Link>
            </div>
            <div className="rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-[#e8f4ff] to-[#f8fbff] p-5 shadow-soft transition-transform hover:scale-[1.02]">
              <div className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-brand shadow-soft">
                تولید کارگاه
              </div>
              <h3 className="text-lg font-black text-foreground">سفارشی‌سازی برای خانواده‌های دقیق‌تر</h3>
              <p className="mt-2 text-xs leading-7 text-muted-foreground">رنگ، ابعاد و حال‌وهوای دکور را می‌توان با نیاز واقعی اتاق کودک هماهنگ کرد.</p>
              <Link to="/contact" className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold text-brand">
                ثبت سفارش ساخت
                <ArrowUpLeft className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {data && data.flashSale.length > 0 ? (
        <section className="container-page py-8">
          <div className="relative overflow-hidden rounded-[2.3rem] border border-sale/20 bg-gradient-to-br from-[#fff0eb] via-[#fff8f5] to-white p-5 shadow-soft md:p-7">
            <div className="absolute -left-8 top-6 size-28 rounded-full bg-sale/10 blur-2xl" />
            <div className="absolute bottom-6 right-6 size-32 rounded-full bg-brand/10 blur-2xl" />
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-black text-sale">
                <Flame className="size-5" aria-hidden />
                حراج شگفت‌انگیز امروز
              </h2>
              <Link to="/offers" className="rounded-full border border-sale/20 bg-white px-4 py-2 text-xs font-extrabold text-sale shadow-soft">
                همهٔ تخفیف‌ها
              </Link>
            </div>
            <ProductGrid products={data.flashSale} columns={4} {...gridProps} />
          </div>
        </section>
      ) : null}

      <section className="container-page py-8">
        <div className="section-shell p-5 md:p-7">
          <SectionHeading
            title="محصولات تازه رسیده"
            subtitle="جدیدترین کالاهایی که با حساسیت و سلیقه به فروشگاه اضافه شده‌اند"
            moreHref="/search"
          />
          <ProductGrid products={data?.newest ?? []} columns={4} {...gridProps} emptyMessage="در حال بارگزاری محصولات…" />
        </div>
      </section>

      <section className="container-page py-8">
        <div className="section-shell bg-gradient-to-br from-[#fffaf3] to-white p-5 md:p-7">
          <SectionHeading title="پرفروش‌ترین‌های ما" subtitle="محبوب‌ترین انتخاب خانواده‌ها در ماه‌های اخیر" moreHref="/search" />
          <ProductGrid products={data?.bestSellers ?? []} columns={4} {...gridProps} emptyMessage="در حال بارگزاری…" />
        </div>
      </section>

      <section ref={workshopRef} className="container-page py-8">
        <div className="reveal storybook-panel overflow-hidden md:p-2">
          <div className="grid items-center gap-6 p-6 md:grid-cols-[1.02fr_.98fr] md:p-10">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-extrabold text-brand">
                <WandSparkles className="size-3.5" aria-hidden />
                {toFaDigits(15)} سال تجربه در {business.city}
              </span>
              <h2 className="text-2xl font-black leading-[1.35] text-foreground md:text-[2rem]">
                سرویس خواب سفارشی، رنگ‌های گرم، و دکوری که برای اتاق کودک جان داشته باشد
              </h2>
              <p className="text-sm leading-8 text-muted-foreground">
                رنگ، اندازه و طرح دلخواهتان را بگویید تا در {business.customBuildDays} برایتان بسازیم؛ با {toFaDigits(business.structureWarrantyMonths)} ماه ضمانت سازه و تحویل حضوری در فروشگاه.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact" className="toy-button rounded-full bg-gradient-to-r from-brand to-sale px-6 py-3 text-sm font-extrabold text-primary-foreground">
                  ثبت سفارش ساخت
                </Link>
                <Link to="/about" className="rounded-full border border-white/70 bg-white px-5 py-3 text-sm font-bold text-foreground shadow-soft">
                  دربارهٔ کارگاه
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <img src="/images/workshop.jpg" alt="کارگاه تولید سرویس خواب نوزاد" loading="lazy" className="h-56 w-full rounded-[1.8rem] object-cover shadow-soft sm:h-full" />
              <img src="/images/hero-nursery.jpg" alt="چیدمان اتاق نوزاد" loading="lazy" className="h-56 w-full rounded-[1.8rem] object-cover shadow-soft sm:h-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-14 pt-8">
        <div className="section-shell bg-gradient-to-br from-[#fdf2ff] to-white p-5 md:p-7">
          <SectionHeading title="پیشنهادهای منتخب فروشگاه" subtitle="محصولات ویژه، کاربردی و دوست‌داشتنی برای خرید مطمئن‌تر" moreHref="/search" />
          <ProductGrid products={data?.featured ?? []} columns={4} {...gridProps} emptyMessage="در حال بارگزاری…" />
        </div>
      </section>
    </StoreShell>
  );
}
