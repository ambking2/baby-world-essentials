import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  BatteryCharging,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  MessageSquare,
  Minus,
  Plus,
  RotateCcw,
  Scan,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/store/Breadcrumb";
import { SectionHeading } from "@/components/store/SectionHeading";
import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { addCartItem } from "@/server/functions/cart";
import { getProductPage } from "@/server/functions/products";
import type { ProductVariant } from "@/server/repo/products";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

type TabKey = "description" | "attributes" | "reviews";

function ProductPage() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("description");

  const pageQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductPage({ data: { slug } }),
  });

  const product = pageQuery.data?.product ?? null;
  const variants = product?.variants ?? [];
  const hasVariants = variants.length > 0;

  // Recently Viewed Logic
  useEffect(() => {
    if (product) {
      const recentlyViewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      const filtered = recentlyViewed.filter((p: any) => p.id !== product.id);
      const updated = [{ id: product.id, title: product.title, slug: product.slug, image: product.cover, price: product.effectivePrice }, ...filtered].slice(0, 10);
      localStorage.setItem("recently_viewed", JSON.stringify(updated));
    }
  }, [product]);

  const sizes = useMemo(
    () => Array.from(new Set(variants.map((variant) => variant.size).filter((value): value is string => Boolean(value)))),
    [variants],
  );
  const colors = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const variant of variants) {
      if (variant.color) map.set(variant.color, variant.colorHex);
    }
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [variants]);

  const selectedVariant: ProductVariant | null = useMemo(() => {
    if (!hasVariants) return null;
    return (
      variants.find(
        (variant) =>
          (sizes.length === 0 || variant.size === size) && (colors.length === 0 || variant.color === color),
      ) ?? null
    );
  }, [hasVariants, variants, sizes.length, colors.length, size, color]);

  const addToCart = useMutation({
    mutationFn: () => {
      if (!product) throw new Error("no product");
      return addCartItem({
        data: {
          productId: product.id,
          variantId: selectedVariant?.id ?? null,
          qty,
        },
      });
    },
    onSuccess: (result) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: storeKeys.cart });
    },
    onError: () => toast.error("افزودن به سبد انجام نشد؛ موجودی را بررسی کنید."),
  });

  if (pageQuery.isLoading) return <StoreShell><div className="container-page py-20 text-center text-on-surface-variant">در حال بارگذاری…</div></StoreShell>;
  if (!product) return <StoreShell><div className="container-page py-20 text-center">محصول پیدا نشد.</div></StoreShell>;

  const images = product.images.length > 0 ? product.images : [{ url: product.cover ?? "/assets/images/nursery-6.jpg", alt: product.title }];
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const unitPrice = product.effectivePrice + (selectedVariant?.priceDelta ?? 0);
  const needsSelection = hasVariants && !selectedVariant;
  const hasDiscount = product.price > unitPrice;
  const discountPercent = hasDiscount ? Math.round((1 - unitPrice / product.price) * 100) : 0;

  const TABS: Array<{ key: TabKey; label: string }> = [
    { key: "description", label: "توضیحات" },
    { key: "attributes", label: "مشخصات فنی" },
    { key: "reviews", label: `دیدگاه‌ها${product.ratingCount > 0 ? ` (${toFaDigits(product.ratingCount)})` : ""}` },
  ];

  return (
    <StoreShell>
      <div className="container-page py-6">
        <Breadcrumb
          items={[
            ...(product.categoryTitle && product.categorySlug
              ? [{ title: product.categoryTitle, href: `/category/${product.categorySlug}` }]
              : []),
            { title: product.title },
          ]}
          className="mb-2"
        />

        {/* Hero card: gallery + buy panel */}
        <section className="card-soft mb-12 rounded-xl p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Gallery */}
            <div className="lg:col-span-6">
              <div className="group relative aspect-square overflow-hidden rounded-xl bg-surface-container-low shadow-inner">
                <img
                  src={images[activeImage]?.url ?? images[0]?.url}
                  alt={images[activeImage]?.alt ?? product.title}
                  className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                />
                {/* Badge stack */}
                <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
                  {hasDiscount ? (
                    <span className="rounded-full bg-secondary-container px-3 py-1.5 text-xs font-bold text-on-secondary shadow-md">
                      ٪{toFaDigits(discountPercent)} تخفیف
                    </span>
                  ) : null}
                  {product.badge ? (
                    <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-on-primary shadow-md">
                      {product.badge}
                    </span>
                  ) : null}
                </div>
              </div>

              {images.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {images.slice(0, 4).map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={cn(
                        "aspect-square overflow-hidden rounded-2xl border-2 bg-surface-container-lowest p-1 transition-all",
                        idx === activeImage ? "border-primary shadow-md shadow-primary/15" : "border-transparent opacity-70 hover:opacity-100",
                      )}
                    >
                      <img src={image.url} alt="" className="h-full w-full rounded-xl object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buy panel */}
            <div className="lg:col-span-6">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between gap-3">
                  {product.categoryTitle ? (
                    <span className="rounded-full bg-primary-fixed px-4 py-1.5 text-[12px] font-bold text-on-primary-fixed">
                      {product.categoryTitle}
                    </span>
                  ) : <span />}
                  <span className="font-mono text-[11px] text-on-surface-variant" dir="ltr">
                    SKU: {toFaDigits(product.code)}
                  </span>
                </div>

                <h1 className="font-headline-md text-headline-md leading-snug text-on-surface">{product.title}</h1>
                {product.subtitle ? (
                  <p className="text-sm leading-7 text-on-surface-variant">{product.subtitle}</p>
                ) : null}

                {/* Rating + stock row */}
                <div className="flex flex-wrap items-center gap-3 border-b border-surface-container pb-4">
                  <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-700">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {toFaDigits(product.ratingAverage || 0)}
                  </span>
                  {product.ratingCount > 0 ? (
                    <button onClick={() => setActiveTab("reviews")} className="text-[12px] text-on-surface-variant underline-offset-4 hover:text-primary hover:underline">
                      {toFaDigits(product.ratingCount)} دیدگاه کاربر
                    </button>
                  ) : null}
                  <span className={cn("mr-auto rounded-full px-3 py-1 text-[12px] font-bold", stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-error-container text-on-error-container")}>
                    {stock > 0 ? "موجود در انبار" : "ناموجود"}
                  </span>
                </div>

                {/* Size selection */}
                {sizes.length > 0 && (
                  <div>
                    <span className="font-label-md text-label-md mb-3 block font-bold text-on-surface">انتخاب سایز</span>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={cn(
                            "min-w-12 rounded-full border px-4 py-2 text-[13px] font-bold transition-all",
                            size === s
                              ? "border-primary bg-primary-fixed text-on-primary-fixed"
                              : "border-outline-variant text-on-surface-variant hover:border-primary/50",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color selection */}
                {colors.length > 0 && (
                  <div>
                    <span className="font-label-md text-label-md mb-3 block font-bold text-on-surface">
                      انتخاب رنگ{color ? <span className="mr-2 font-normal text-primary">{color}</span> : null}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setColor(c.name)}
                          title={c.name}
                          className={cn(
                            "flex size-10 items-center justify-center rounded-full transition-all",
                            color === c.name
                              ? "ring-4 ring-primary ring-offset-2 ring-offset-surface-container-lowest"
                              : "ring-1 ring-outline-variant hover:ring-primary/40",
                          )}
                        >
                          <span className="block size-8 rounded-full" style={{ backgroundColor: c.hex ?? "#ccc" }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights */}
                <ul className="space-y-2 rounded-2xl border border-surface-container p-4">
                  {[
                    { icon: ShieldCheck, text: "ضمانت اصالت و سلامت فیزیکی کالا" },
                    { icon: RotateCcw, text: "۷ روز ضمانت بازگشت بدون قید و شرط" },
                    { icon: Truck, text: `ارسال سریع به سراسر ایران — رایگان بالای ${formatToman(business.freeShippingThreshold ?? 0)}` },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-2.5 text-[13px] text-on-surface-variant">
                      <item.icon className="size-4 shrink-0 text-primary" />
                      {item.text}
                    </li>
                  ))}
                </ul>

                {/* Price + actions */}
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-surface-container-low to-primary-fixed/20 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    {hasDiscount ? (
                      <>
                        <span className="text-sm text-on-surface-variant line-through">{formatToman(product.price)}</span>
                        <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-[11px] font-bold text-secondary">
                          ٪{toFaDigits(discountPercent)}-
                        </span>
                      </>
                    ) : null}
                    <span className="font-price-display text-price-display mr-auto text-primary">
                      {formatToman(unitPrice)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <div className="flex items-center justify-between rounded-full border border-surface-container bg-surface-container-lowest p-1.5 shadow-inner sm:w-36">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="flex size-8 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-primary-fixed active:scale-90"
                        aria-label="کاهش تعداد"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-extrabold">{toFaDigits(qty)}</span>
                      <button
                        onClick={() => setQty((q) => Math.min(Math.max(stock, 1), q + 1))}
                        className="flex size-8 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-primary-fixed active:scale-90"
                        aria-label="افزایش تعداد"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>

                    <button
                      disabled={stock <= 0 || addToCart.isPending || needsSelection}
                      onClick={() => addToCart.mutate()}
                      className="flex flex-1 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-primary to-primary-container py-3.5 text-sm font-bold text-on-primary shadow-[0_8px_20px_rgba(0,75,209,0.35)] transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <ShoppingCart className="size-5" />
                      {stock <= 0 ? "ناموجود" : needsSelection ? "ابتدا مشخصات را انتخاب کنید" : "افزودن به سبد خرید"}
                    </button>

                    <button
                      onClick={() => toast.success("به علاقه‌مندی‌ها اضافه شد")}
                      className="flex size-13 items-center justify-center self-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary-fixed active:scale-95"
                      aria-label="افزودن به علاقه‌مندی‌ها"
                    >
                      <Heart className="size-5" />
                    </button>
                  </div>
                </div>

                {/* Trust grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: BadgeCheck, label: "ضمانت اصالت" },
                    { icon: Scan, label: "بازگشت ۷ روزه" },
                    { icon: CreditCard, label: "پرداخت امن" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-2xl border border-surface-container bg-surface-container-lowest p-3 text-center shadow-sm">
                      <item.icon className="size-5 text-primary" />
                      <span className="text-[11px] font-bold text-on-surface">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs card */}
        <section className="card-soft mb-16 rounded-xl p-6 md:p-10">
          <div className="flex gap-2 overflow-x-auto border-b border-surface-container pb-0 md:gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-4 px-2 pb-3 text-sm transition-colors",
                  activeTab === tab.key
                    ? "border-primary font-bold text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-8">
            {activeTab === "description" ? (
              <div className="text-body-md font-body-md whitespace-pre-line leading-8 text-on-surface-variant">
                {product.description || "توضیحات به‌زودی اضافه می‌شود."}
              </div>
            ) : null}

            {activeTab === "attributes" ? (
              product.attributes.length > 0 ? (
                <div className="grid gap-x-8 gap-y-2 md:grid-cols-2">
                  {product.attributes.map((attr) => (
                    <div key={attr.name} className="flex items-center justify-between rounded-xl bg-surface-container-low/60 px-4 py-3 text-[13px]">
                      <span className="font-bold text-on-surface">{attr.name}</span>
                      <span className="text-on-surface-variant">{attr.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">مشخصاتی برای این محصول ثبت نشده است.</p>
              )
            ) : null}

            {activeTab === "reviews" ? (
              <div>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className="rounded-2xl bg-surface-container-low p-5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-full bg-primary-fixed text-[13px] font-black text-primary">
                            {review.name?.trim()?.[0] ?? "؟"}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{review.name}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={cn("size-3", i < review.rating ? "fill-orange-400 text-orange-400" : "text-outline-variant")} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 whitespace-pre-line text-[13px] leading-7 text-on-surface-variant">{review.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant">هنوز دیدگاهی برای این محصول ثبت نشده است. اولین نفر باشید!</p>
                )}
                <Link
                  to="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary-fixed"
                >
                  <MessageSquare className="size-4" />
                  ثبت دیدگاه
                </Link>
              </div>
            ) : null}
          </div>
        </section>

        {/* Related products */}
        {pageQuery.data?.related && pageQuery.data.related.length > 0 && (
          <div className="mb-16">
            <SectionHeading
              title="محصولات مشابه"
              subtitle="محصولاتی که ممکن است بپسندید"
              align="start"
              className="mb-10"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {pageQuery.data.related.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed (Client Side Only) */}
        <RecentlyViewedSection currentId={product.id} />
      </div>

      {/* Mobile sticky add-to-cart bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl bg-surface-container-lowest/95 p-4 shadow-[0_-8px_30px_rgba(0,75,209,0.1)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            {hasDiscount ? (
              <span className="text-[11px] text-on-surface-variant line-through">{formatToman(product.price)}</span>
            ) : null}
            <span className="font-price-display text-price-display text-primary">{formatToman(unitPrice)}</span>
          </div>
          <button
            disabled={stock <= 0 || addToCart.isPending || needsSelection}
            onClick={() => addToCart.mutate()}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container py-3.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/30 active:scale-95 disabled:opacity-50"
          >
            <ShoppingCart className="size-4" />
            {stock <= 0 ? "ناموجود" : "افزودن به سبد"}
          </button>
        </div>
      </div>
      <div className="h-24 lg:hidden" />
    </StoreShell>
  );
}

function RecentlyViewedSection({ currentId }: { currentId: number }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const recentlyViewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
    setItems(recentlyViewed.filter((p: any) => p.id !== currentId));
  }, [currentId]);

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <SectionHeading
        title="اخیراً مشاهده شده"
        subtitle="کالاهایی که اخیراً بررسی کردید"
        align="start"
        className="mb-10"
      />
      <div className="hide-scrollbar flex gap-5 overflow-x-auto pb-4">
        {items.map((p) => (
          <div key={p.id} className="w-[240px] shrink-0">
            <ProductCard product={p as any} />
          </div>
        ))}
      </div>
    </div>
  );
}
