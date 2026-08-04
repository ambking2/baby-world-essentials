import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Minus, Plus, ShoppingCart, Truck, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/store/Breadcrumb";
import { Countdown } from "@/components/store/Countdown";
import { Price } from "@/components/store/Price";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Rating } from "@/components/store/Rating";
import { SectionHeading } from "@/components/store/SectionHeading";
import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { formatJalali, formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { addCartItem } from "@/server/functions/cart";
import { getProductPage, submitReview } from "@/server/functions/products";
import type { ProductCard, ProductVariant } from "@/server/repo/products";

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
  const [tab, setTab] = useState<TabKey>("description");
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");

  const pageQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductPage({ data: { slug } }),
  });

  const product = pageQuery.data?.product ?? null;
  const variants = product?.variants ?? [];
  const hasVariants = variants.length > 0;

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

  const sendReview = useMutation({
    mutationFn: () => {
      if (!product) throw new Error("no product");
      return submitReview({
        data: { productId: product.id, name: reviewName, rating: reviewRating, body: reviewBody },
      });
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setReviewName("");
      setReviewBody("");
      setReviewRating(5);
    },
    onError: () => toast.error("ثبت دیدگاه انجام نشد؛ فیلدها را کامل کنید."),
  });

  if (pageQuery.isLoading) {
    return (
      <StoreShell>
        <div className="container-page grid gap-6 py-10 md:grid-cols-2">
          <div className="skeleton aspect-square rounded-3xl" />
          <div className="space-y-3">
            <div className="skeleton h-7 w-2/3 rounded-xl" />
            <div className="skeleton h-5 w-1/3 rounded-xl" />
            <div className="skeleton h-24 rounded-2xl" />
          </div>
        </div>
      </StoreShell>
    );
  }

  if (!product) {
    return (
      <StoreShell>
        <div className="container-page py-20 text-center">
          <h1 className="text-lg font-extrabold">این محصول پیدا نشد</h1>
          <p className="mt-2 text-sm text-muted-foreground">ممکن است از فروشگاه حذف شده یا نشانی اشتباه باشد.</p>
        </div>
      </StoreShell>
    );
  }

  const images = product.images.length > 0 ? product.images : [{ url: product.cover ?? "/images/cat-toys.jpg", alt: product.title }];
  const isClothing = product.categoryKind === "clothing";
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const unitPrice = product.effectivePrice + (selectedVariant?.priceDelta ?? 0);
  const needsSelection = hasVariants && !selectedVariant;

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
          className="mb-4"
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* گالری */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <img
                src={images[activeImage]?.url ?? images[0]?.url}
                alt={images[activeImage]?.alt ?? product.title}
                className="aspect-square w-full object-cover"
              />
            </div>
            {images.length > 1 ? (
              <div className="hide-scrollbar flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      "size-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors",
                      index === activeImage ? "border-brand" : "border-border",
                    )}
                  >
                    <img src={image.url} alt={image.alt ?? ""} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* اطلاعات خرید */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {product.badge ? (
                <span className="rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-primary-foreground">{product.badge}</span>
              ) : null}
              {product.madeInWorkshop ? (
                <span className="rounded-full bg-installment px-3 py-1 text-[11px] font-bold text-installment-foreground">
                  تولید کارگاه خودمان
                </span>
              ) : null}
              <span className="text-[11px] text-muted-foreground">کد کالا: {toFaDigits(product.code)}</span>
            </div>

            <h1 className="text-xl font-extrabold leading-8 text-foreground md:text-2xl">{product.title}</h1>
            {product.subtitle ? <p className="text-sm text-muted-foreground">{product.subtitle}</p> : null}

            <Rating value={product.ratingAverage} count={product.ratingCount} showValue />

            <div className="rounded-3xl border border-border bg-card p-4">
              <Price price={product.price + (selectedVariant?.priceDelta ?? 0)} effectivePrice={unitPrice} size="lg" />
              {product.saleActive && product.saleEndsAt ? (
                <div className="mt-3">
                  <p className="mb-1.5 text-xs font-bold text-sale">زمان باقی‌مانده تا پایان تخفیف:</p>
                  <Countdown endsAt={product.saleEndsAt} />
                </div>
              ) : null}

              {/* انتخاب سایز و رنگ */}
              {sizes.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-extrabold">{isClothing ? "انتخاب سایز (ماه)" : "انتخاب اندازه"}</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSize(item)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
                          size === item ? "border-brand bg-brand text-primary-foreground" : "border-border hover:border-brand",
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {colors.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-extrabold">انتخاب رنگ</p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setColor(item.name)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
                          color === item.name ? "border-brand text-brand" : "border-border hover:border-brand",
                        )}
                      >
                        <span className="size-4 rounded-full border border-border" style={{ backgroundColor: item.hex ?? "#ddd" }} aria-hidden />
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* تعداد و خرید */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-border p-1">
                  <button
                    type="button"
                    onClick={() => setQty((value) => Math.min(value + 1, 20))}
                    className="grid size-8 place-items-center rounded-lg hover:bg-secondary"
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="size-4" aria-hidden />
                  </button>
                  <span className="min-w-8 text-center text-sm font-extrabold">{toFaDigits(qty)}</span>
                  <button
                    type="button"
                    onClick={() => setQty((value) => Math.max(value - 1, 1))}
                    className="grid size-8 place-items-center rounded-lg hover:bg-secondary"
                    aria-label="کاهش تعداد"
                  >
                    <Minus className="size-4" aria-hidden />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={stock <= 0 || addToCart.isPending || needsSelection}
                  onClick={() => addToCart.mutate()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <ShoppingCart className="size-4" aria-hidden />
                  {stock <= 0
                    ? "فعلاً ناموجود"
                    : needsSelection
                      ? "ابتدا سایز/رنگ را انتخاب کنید"
                      : "افزودن به سبد خرید"}
                </button>
              </div>

              <p className="mt-2 text-[11px] text-muted-foreground">
                {stock > 0 ? `موجودی فعلی: ${toFaDigits(stock)} عدد` : "برای اطلاع از موجودی تماس بگیرید."}
              </p>
            </div>

            <ul className="grid gap-2 sm:grid-cols-3">
              <li className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-[11px]">
                <Truck className="size-4 text-brand" aria-hidden />
                ارسال رایگان بالای {formatToman(business.freeShippingThreshold)}
              </li>
              <li className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-[11px]">
                <Undo2 className="size-4 text-brand" aria-hidden />
                مردودی تا {toFaDigits(business.returnWindowDays)} روز
              </li>
              <li className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-[11px]">
                <BadgeCheck className="size-4 text-brand" aria-hidden />
                {toFaDigits(business.structureWarrantyMonths)} ماه ضمانت سازه
              </li>
            </ul>
          </div>
        </div>

        {/* تب‌ها */}
        <div className="mt-10 rounded-3xl border border-border bg-card">
          <div className="flex flex-wrap gap-1 border-b border-border p-2">
            {([
              ["description", "توضیحات محصول"],
              ["attributes", "مشخصات فنی"],
              ["reviews", "دیدگاه مشتریان"],
            ] as Array<[TabKey, string]>).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-bold transition-colors",
                  tab === key ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === "description" ? (
              <p className="whitespace-pre-line text-sm leading-8 text-muted-foreground">
                {product.description ?? "توضیحات این محصول به‌زودی تکمیل می‌شود."}
              </p>
            ) : null}

            {tab === "attributes" ? (
              <table className="w-full text-sm">
                <tbody>
                  {product.attributes.map((attribute) => (
                    <tr key={attribute.name} className="border-b border-border/60 last:border-0">
                      <th className="w-40 py-2.5 text-start text-xs font-bold text-muted-foreground">{attribute.name}</th>
                      <td className="py-2.5 text-xs text-foreground">{attribute.value}</td>
                    </tr>
                  ))}
                  {product.weightGrams > 0 ? (
                    <tr>
                      <th className="w-40 py-2.5 text-start text-xs font-bold text-muted-foreground">وزن</th>
                      <td className="py-2.5 text-xs text-foreground">{toFaDigits(product.weightGrams)} گرم</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            ) : null}

            {tab === "reviews" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  {product.reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">هنوز دیدگاهی برای این محصول ثبت نشده است.</p>
                  ) : (
                    product.reviews.map((review) => (
                      <div key={review.id} className="rounded-2xl border border-border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-extrabold">{review.name}</span>
                          <span className="text-[11px] text-muted-foreground">{formatJalali(review.createdAt)}</span>
                        </div>
                        <Rating value={review.rating} />
                        <p className="mt-2 text-xs leading-6 text-muted-foreground">{review.body}</p>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendReview.mutate();
                  }}
                  className="space-y-3 rounded-2xl border border-border p-4"
                >
                  <h3 className="text-sm font-extrabold">ثبت دیدگاه دربارهٔ این کالا</h3>
                  <input
                    value={reviewName}
                    onChange={(event) => setReviewName(event.target.value)}
                    placeholder="نام شما"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-brand"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">امتیاز:</span>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        className={cn(
                          "size-8 rounded-lg border text-xs font-bold",
                          reviewRating === value ? "border-brand bg-brand text-primary-foreground" : "border-border",
                        )}
                      >
                        {toFaDigits(value)}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewBody}
                    onChange={(event) => setReviewBody(event.target.value)}
                    rows={4}
                    placeholder="تجربهٔ خود را بنویسید…"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-brand"
                  />
                  <button
                    type="submit"
                    disabled={sendReview.isPending}
                    className="rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
                  >
                    {sendReview.isPending ? "در حال ارسال…" : "ارسال دیدگاه"}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>

        {/* محصولات مرتبط */}
        {(pageQuery.data?.related ?? []).length > 0 ? (
          <section className="mt-12">
            <SectionHeading title="محصولات مرتبط" subtitle="کالاهایی که ممکن است دوست داشته باشید" />
            <ProductGrid products={(pageQuery.data?.related ?? []) as Array<ProductCard>} columns={4} />
          </section>
        ) : null}
      </div>
    </StoreShell>
  );
}
