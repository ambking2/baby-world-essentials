import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Sparkles } from "lucide-react";
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

      <div className="pt-8">
        <TrustBadges />
      </div>

      {categories.length > 0 ? <CategoryStrip categories={categories} /> : null}

      {data && data.flashSale.length > 0 ? (
        <section className="container-page py-6">
          <div className="overflow-hidden rounded-[2rem] border border-sale/30 bg-sale/5 p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-sale">
                <Flame className="size-5" aria-hidden />
                حراج شگفت‌انگیز
              </h2>
              <Link to="/offers" className="text-xs font-bold text-sale hover:underline">
                همهٔ تخفیف‌ها
              </Link>
            </div>
            <ProductGrid products={data.flashSale} columns={4} {...gridProps} />
          </div>
        </section>
      ) : null}

      <section className="container-page py-8">
        <SectionHeading
          title="محصولات تازه رسیده"
          subtitle="جدیدترین کالاهایی که به فروشگاه اضافه شده‌اند"
          moreHref="/search"
        />
        <ProductGrid products={data?.newest ?? []} columns={4} {...gridProps} emptyMessage="در حال بارگزاری محصولات…" />
      </section>

      <section className="container-page py-8">
        <SectionHeading title="پرفروش‌ترین‌های ما" subtitle="انتخاب محبوب مشتریان در ماه‌های گذشته" moreHref="/search" />
        <ProductGrid products={data?.bestSellers ?? []} columns={4} {...gridProps} emptyMessage="در حال بارگزاری…" />
      </section>

      {/* بنر کارگاه */}
      <section ref={workshopRef} className="container-page py-8">
        <div className="reveal grid items-center gap-6 overflow-hidden rounded-[2rem] border border-border bg-brand-soft/60 p-6 md:grid-cols-2 md:p-10">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-bold text-brand">
              <Sparkles className="size-3.5" aria-hidden />
              {toFaDigits(business.yearsInBusiness)} سال تجربه در {business.city}
            </span>
            <h2 className="text-xl font-extrabold text-foreground md:text-2xl">سرویس خواب سفارشی، ساخت کارگاه خودمان</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              رنگ، اندازه و طرح دلخواهتان را بگویید تا در {business.customBuildDays} برایتان بسازیم؛ با{" "}
              {toFaDigits(business.structureWarrantyMonths)} ماه ضمانت سازه و تحویل حضوری در فروشگاه.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/contact"
                className="inline-flex items-center rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                ثبت سفارش ساخت
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-brand hover:text-brand"
              >
                دربارهٔ کارگاه
              </Link>
            </div>
          </div>
          <img src="/images/workshop.jpg" alt="کارگاه تولید سرویس خواب نوزاد" loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover" />
        </div>
      </section>

      <section className="container-page pb-12">
        <SectionHeading title="پیشنهاد ویژهٔ فروشگاه" subtitle="محصولات منتخب و تولیدات کارگاه" moreHref="/search" />
        <ProductGrid products={data?.featured ?? []} columns={4} {...gridProps} emptyMessage="در حال بارگزاری…" />
      </section>
    </StoreShell>
  );
}
