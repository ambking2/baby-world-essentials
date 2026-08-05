import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Minus, Plus, ShoppingCart, Truck, Undo2, Star, Heart, ChevronDown, ShieldCheck, HelpCircle } from "lucide-react";
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

type TabKey = "description" | "attributes" | "reviews" | "shipping" | "warranty" | "faq";

function ProductPage() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<TabKey | null>("description");

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

  if (pageQuery.isLoading) return <StoreShell><div className="container-page py-20">در حال بارگذاری...</div></StoreShell>;
  if (!product) return <StoreShell><div className="container-page py-20 text-center">محصول پیدا نشد.</div></StoreShell>;

  const images = product.images.length > 0 ? product.images : [{ url: product.cover ?? "/assets/images/nursery-6.jpg", alt: product.title }];
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const unitPrice = product.effectivePrice + (selectedVariant?.priceDelta ?? 0);
  const needsSelection = hasVariants && !selectedVariant;

  const AccordionItem = ({ id, title, icon: Icon, children }: { id: TabKey, title: string, icon: any, children: React.ReactNode }) => (
    <div className="border-b border-border">
      <button 
        onClick={() => setOpenSection(openSection === id ? null : id)}
        className="flex w-full items-center justify-between py-6 text-right"
      >
        <div className="flex items-center gap-3">
          <Icon className="size-5 text-muted-foreground" />
          <span className="text-sm font-bold uppercase tracking-widest">{title}</span>
        </div>
        <ChevronDown className={cn("size-4 transition-transform duration-300", openSection === id && "rotate-180")} />
      </button>
      <div className={cn(
        "grid overflow-hidden transition-all duration-300 ease-in-out",
        openSection === id ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <StoreShell>
      <div className="container-page py-10 lg:py-16">
        <Breadcrumb
          items={[
            ...(product.categoryTitle && product.categorySlug
              ? [{ title: product.categoryTitle, href: `/category/${product.categorySlug}` }]
              : []),
            { title: product.title },
          ]}
          className="mb-8"
        />

        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 space-y-6">
              <div className="relative aspect-square overflow-hidden bg-[#F9F9F9] border border-border rounded-2xl">
                <img
                  src={images[activeImage]?.url ?? images[0]?.url}
                  alt={images[activeImage]?.alt ?? product.title}
                  className="h-full w-full object-cover transition-all duration-700 hover:scale-105"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                  {images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={cn(
                        "size-24 shrink-0 border border-border bg-white rounded-xl p-1 transition-all duration-200 overflow-hidden",
                        idx === activeImage ? "border-primary ring-2 ring-primary/20 scale-[1.02]" : "opacity-70 hover:opacity-100 hover:scale-[1.02]"
                      )}
                    >
                      <img src={image.url} alt="" className="h-full w-full object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Info & Purchase */}
          <div className="lg:col-span-5">
            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-md">{product.categoryTitle}</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={cn("size-3.5", i <= product.ratingAverage ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                    ))}
                  </div>
                  <span className="text-[12px] font-bold text-gray-900">{toFaDigits(product.ratingAverage)}</span>
                  <span className="text-[12px] text-muted-foreground">({toFaDigits(product.ratingCount)} دیدگاه)</span>
                </div>
              </div>

              <h1 className="mb-3 text-3xl font-bold lg:text-4xl text-gray-900 leading-tight">{product.title}</h1>
              <p className="mb-6 text-sm text-muted-foreground leading-relaxed">{product.subtitle}</p>

              <div className="mb-10 flex items-baseline gap-4">
                <span className="text-3xl font-bold text-gray-900">{formatToman(unitPrice)}</span>
                {product.price > unitPrice && (
                  <span className="text-lg text-muted-foreground line-through opacity-50">{formatToman(product.price)}</span>
                )}
                {product.price > unitPrice && (
                  <span className="bg-destructive text-white text-[11px] font-bold px-2 py-1 rounded-md">
                    ٪{toFaDigits(Math.round((1 - unitPrice / product.price) * 100))} تخفیف
                  </span>
                )}
              </div>

              {/* Sticky Purchase Panel on Mobile would be different, here we just style it premium */}
              <div className="space-y-10 border-t border-border pt-10">
                {sizes.length > 0 && (
                  <div>
                    <span className="mb-4 block text-[11px] font-bold uppercase tracking-widest text-gray-900">انتخاب سایز</span>
                    <div className="flex flex-wrap gap-3">
                      {sizes.map(s => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={cn(
                            "min-w-14 border px-4 py-2.5 text-[13px] font-medium transition-all duration-200 rounded-lg",
                            size === s ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground"
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
                    <span className="mb-4 block text-[11px] font-bold uppercase tracking-widest text-gray-900">انتخاب رنگ</span>
                    <div className="flex flex-wrap gap-6">
                      {colors.map(c => (
                        <button
                          key={c.name}
                          onClick={() => setColor(c.name)}
                          className={cn(
                            "group flex flex-col items-center gap-2",
                            color === c.name ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span 
                            className={cn(
                              "size-9 rounded-full border border-border p-0.5 transition-all duration-200", 
                              color === c.name && "ring-2 ring-foreground ring-offset-4"
                            )}
                          >
                            <span className="block h-full w-full rounded-full" style={{ backgroundColor: c.hex ?? "#ccc" }} />
                          </span>
                          <span className="text-[11px] font-medium">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex items-center justify-between border border-border bg-[#F9F9F9] rounded-xl px-2 h-14">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-3 text-muted-foreground hover:text-foreground transition-colors"><Minus className="size-4" /></button>
                    <span className="min-w-10 text-center text-sm font-bold text-gray-900">{toFaDigits(qty)}</span>
                    <button onClick={() => setQty(q => Math.min(20, q + 1))} className="p-3 text-muted-foreground hover:text-foreground transition-colors"><Plus className="size-4" /></button>
                  </div>
                  
                  <button
                    disabled={stock <= 0 || addToCart.isPending || needsSelection}
                    onClick={() => addToCart.mutate()}
                    className="btn-primary flex-1 h-14 flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="size-5" />
                    <span>{stock <= 0 ? "ناموجود" : needsSelection ? "انتخاب مشخصات" : "افزودن به سبد خرید"}</span>
                  </button>
                  
                  <button className="hidden sm:flex size-14 items-center justify-center border border-border rounded-xl transition-all duration-300 hover:border-foreground/20 hover:bg-muted/30 active:scale-95">
                    <Heart className="size-5" />
                  </button>
                </div>
              </div>

              {/* Accordions */}
              <div className="mt-12 border-t border-border">
                <AccordionItem id="description" title="توضیحات محصول" icon={ShieldCheck}>
                  {product.description || "توضیحات به‌زودی..."}
                </AccordionItem>
                <AccordionItem id="attributes" title="مشخصات فنی" icon={BadgeCheck}>
                  <div className="grid grid-cols-1 gap-y-3">
                    {product.attributes.map(attr => (
                      <div key={attr.name} className="flex justify-between border-b border-border/30 py-2 last:border-0">
                        <span className="font-bold text-gray-900">{attr.name}</span>
                        <span>{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
                <AccordionItem id="shipping" title="اطلاعات ارسال" icon={Truck}>
                  ارسال سریع با پست پیشتاز و تیپاکس به سراسر کشور.
                  ارسال رایگان برای خریدهای بالای {formatToman(business.freeShippingThreshold || 0)}.
                  زمان تحویل: ۲ تا ۵ روز کاری.
                </AccordionItem>
                <AccordionItem id="warranty" title="گارانتی و بازگشت" icon={Undo2}>
                  ۷ روز ضمانت بازگشت کالا در صورت عدم رضایت یا وجود نقص فنی.
                  ضمانت اصالت و سلامت فیزیکی کالا.
                </AccordionItem>
                <AccordionItem id="faq" title="سوالات متداول" icon={HelpCircle}>
                  سوالات رایج مشتریان در مورد این محصول...
                </AccordionItem>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {pageQuery.data?.related && pageQuery.data.related.length > 0 && (
          <div className="mt-32">
            <SectionHeading 
              title="محصولات مشابه" 
              subtitle="محصولاتی که ممکن است بپسندید"
              align="start"
              className="mb-12"
            />
            <div className="grid-products">
              {pageQuery.data.related.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed (Client Side Only) */}
        <RecentlyViewedSection currentId={product.id} />
      </div>
      
      {/* Mobile Sticky Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-border p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[10px] text-muted-foreground mb-0.5">قیمت کالا</div>
            <div className="text-lg font-bold text-gray-900">{formatToman(unitPrice)}</div>
          </div>
          <button
            disabled={stock <= 0 || addToCart.isPending || needsSelection}
            onClick={() => addToCart.mutate()}
            className="btn-primary px-10"
          >
            {stock <= 0 ? "ناموجود" : "افزودن به سبد"}
          </button>
        </div>
      </div>
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
    <div className="mt-32 border-t border-border pt-20">
      <SectionHeading 
        title="اخیراً مشاهده شده" 
        subtitle="کالاهایی که اخیراً بررسی کردید"
        align="start"
        className="mb-12"
      />
      <div className="hide-scrollbar flex gap-6 overflow-x-auto pb-8">
        {items.map(p => (
          <div key={p.id} className="w-[260px] shrink-0">
            <ProductCard product={p as any} />
          </div>
        ))}
      </div>
    </div>
  );
}