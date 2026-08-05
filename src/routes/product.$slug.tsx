import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Minus, Plus, ShoppingCart, Truck, Undo2, Star, Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/store/Breadcrumb";
import { SectionHeading } from "@/components/store/SectionHeading";
import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { addCartItem } from "@/server/functions/cart";
import { getProductPage, submitReview } from "@/server/functions/products";
import type { ProductVariant } from "@/server/repo/products";

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

  if (pageQuery.isLoading) return <StoreShell><div className="container-page py-20">در حال بارگذاری...</div></StoreShell>;
  if (!product) return <StoreShell><div className="container-page py-20 text-center">محصول پیدا نشد.</div></StoreShell>;

  const images = product.images.length > 0 ? product.images : [{ url: product.cover ?? "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop", alt: product.title }];
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const unitPrice = product.effectivePrice + (selectedVariant?.priceDelta ?? 0);
  const needsSelection = hasVariants && !selectedVariant;

  return (
    <StoreShell>
      <div className="container-page py-10 lg:py-20">
        <Breadcrumb
          items={[
            ...(product.categoryTitle && product.categorySlug
              ? [{ title: product.categoryTitle, href: `/category/${product.categorySlug}` }]
              : []),
            { title: product.title },
          ]}
          className="mb-10"
        />

        <div className="grid gap-16 lg:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="aspect-square overflow-hidden bg-muted/20 border border-border/50 rounded-2xl shadow-sm">
              <img
                src={images[activeImage]?.url ?? images[0]?.url}
                alt={images[activeImage]?.alt ?? product.title}
                className="h-full w-full object-cover transition-premium"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                    "size-20 shrink-0 border-b-2 bg-muted/20 rounded-md p-1 transition-premium",
                      idx === activeImage ? "border-primary opacity-100 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info & Purchase */}
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span>{product.categoryTitle}</span>
              <div className="flex items-center gap-1">
                <Star className="size-3 fill-primary text-primary" />
                <span className="text-foreground">{toFaDigits(product.ratingAverage)}</span>
                <span className="font-medium">({toFaDigits(product.ratingCount)})</span>
              </div>
            </div>

            <h1 className="mb-6 text-3xl font-bold lg:text-5xl">{product.title}</h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">{product.subtitle}</p>

            <div className="mb-10 flex items-baseline gap-4">
              <span className="text-3xl font-bold">{formatToman(unitPrice)}</span>
              {product.price > unitPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatToman(product.price)}</span>
              )}
            </div>

            <div className="mb-10 space-y-8 border-y border-border py-10">
              {sizes.length > 0 && (
                <div>
                  <span className="mb-4 block text-xs font-bold uppercase tracking-widest">انتخاب سایز</span>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={cn(
                          "min-w-12 border px-4 py-2 text-sm font-medium transition-premium rounded-md",
                          size === s ? "border-primary bg-primary text-white" : "border-border hover:border-primary/50"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div>
                  <span className="mb-4 block text-xs font-bold uppercase tracking-widest">انتخاب رنگ</span>
                  <div className="flex flex-wrap gap-4">
                    {colors.map(c => (
                      <button
                        key={c.name}
                        onClick={() => setColor(c.name)}
                        className={cn(
                          "group flex items-center gap-2 text-sm font-medium transition-premium",
                          color === c.name ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span 
                          className={cn("size-6 rounded-full border border-border transition-premium", color === c.name && "ring-2 ring-foreground ring-offset-2")}
                          style={{ backgroundColor: c.hex ?? "#ccc" }}
                        />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center border border-border px-4 py-2">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2"><Minus className="size-4" /></button>
                  <span className="w-12 text-center text-sm font-bold">{toFaDigits(qty)}</span>
                  <button onClick={() => setQty(q => Math.min(20, q + 1))} className="p-2"><Plus className="size-4" /></button>
                </div>
                <button
                  disabled={stock <= 0 || addToCart.isPending || needsSelection}
                  onClick={() => addToCart.mutate()}
                  className="btn-primary flex-1 py-4 text-sm font-bold uppercase tracking-widest"
                >
                  {stock <= 0 ? "ناموجود" : needsSelection ? "انتخاب مشخصات" : "افزودن به سبد خرید"}
                </button>
                <button className="flex size-14 items-center justify-center border border-border transition-premium hover:bg-secondary rounded-md">
                  <Heart className="size-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck className="size-5 text-primary" />
                <div>
                  <h4 className="text-xs font-bold">ارسال سریع</h4>
                  <p className="text-[10px] text-muted-foreground">ارسال رایگان بالای {formatToman(business.freeShippingThreshold || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Undo2 className="size-5 text-primary" />
                <div>
                  <h4 className="text-xs font-bold">بازگشت کالا</h4>
                  <p className="text-[10px] text-muted-foreground">تا {toFaDigits(business.returnWindowDays)} روز کاری</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BadgeCheck className="size-5 text-primary" />
                <div>
                  <h4 className="text-xs font-bold">ضمانت اصالت</h4>
                  <p className="text-[10px] text-muted-foreground">تضمین ۱۰۰٪ کالا</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-32 border-t border-border pt-20">
          <div className="mb-12 flex gap-10 border-b border-border pb-6">
            {(["description", "attributes", "reviews"] as TabKey[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "relative text-sm font-bold uppercase tracking-widest transition-premium",
                  tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "description" ? "توضیحات" : t === "attributes" ? "مشخصات" : "دیدگاه‌ها"}
                {tab === t && <span className="absolute -bottom-[25px] left-0 h-1 w-full bg-primary" />}
              </button>
            ))}
          </div>

          <div className="max-w-4xl animate-fade-in">
            {tab === "description" && (
              <div className="whitespace-pre-line text-base leading-relaxed text-muted-foreground lg:text-lg">
                {product.description || "توضیحات به‌زودی..."}
              </div>
            )}
            {tab === "attributes" && (
              <div className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
                {product.attributes.map(attr => (
                  <div key={attr.name} className="flex justify-between border-b border-border/50 py-3">
                    <span className="text-sm font-bold uppercase tracking-wide">{attr.name}</span>
                    <span className="text-sm text-muted-foreground">{attr.value}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "reviews" && (
              <div className="space-y-12">
                {product.reviews.map(r => (
                  <div key={r.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold">{r.name}</h4>
                        <div className="mt-1 flex gap-0.5">
                          {[1,2,3,4,5].map(i => <Star key={i} className={cn("size-3", i <= r.rating ? "fill-primary text-primary" : "text-border")} />)}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{toFaDigits((r.createdAt ? String(r.createdAt).split('T')[0] : '') as string)}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
