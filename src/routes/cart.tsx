import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight, Truck } from "lucide-react";
import { toast } from "sonner";

import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";
import { deleteCartItem, emptyCart, getCart, updateCartItemQty } from "@/server/functions/cart";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const queryClient = useQueryClient();
  const cartQuery = useQuery({ queryKey: storeKeys.cart, queryFn: () => getCart() });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: storeKeys.cart });
  };

  const setQty = useMutation({
    mutationFn: (input: { itemId: number; qty: number }) => updateCartItemQty({ data: input }),
    onSuccess: refresh,
    onError: () => toast.error("تغییر تعداد انجام نشد؛ موجودی کافی نیست."),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: number) => deleteCartItem({ data: { itemId } }),
    onSuccess: () => {
      toast.success("کالا از سبد حذف شد.");
      refresh();
    },
  });

  const clearAll = useMutation({
    mutationFn: () => emptyCart(),
    onSuccess: () => {
      toast.success("سبد خرید خالی شد.");
      refresh();
    },
  });

  const cart = cartQuery.data;
  const lines = cart?.lines ?? [];

  return (
    <StoreShell>
      <div className="container-page py-10 lg:py-16">
        <h1 className="mb-10 text-3xl font-bold text-gray-900">سبد خرید شما</h1>

        {cartQuery.isLoading ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
            </div>
            <div className="skeleton h-[400px] rounded-2xl" />
          </div>
        ) : lines.length === 0 ? (
          <div className="max-w-2xl mx-auto rounded-[32px] border border-border bg-white p-12 md:p-20 text-center shadow-soft">
            <div className="mx-auto mb-8 relative">
              <div className="size-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <ShoppingBag className="size-10 text-muted-foreground/40" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white size-10 rounded-full border border-border flex items-center justify-center">
                <Plus className="size-5 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">سبد خرید خالی است</h2>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-sm mx-auto">
              هنوز هیچ محصولی به سبد خرید خود اضافه نکرده‌اید. با انتخاب محصولات مورد نظر، خرید خود را آغاز کنید.
            </p>
            <Link
              to="/search"
              search={{ q: "" }}
              className="btn-primary inline-flex items-center gap-3 px-10"
            >
              <span>مشاهده فروشگاه</span>
              <ArrowRight className="size-4 rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            {/* Cart Items */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">کالاهای سبد ({toFaDigits(lines.length)})</span>
                <button
                  type="button"
                  onClick={() => clearAll.mutate()}
                  className="text-[11px] font-bold uppercase tracking-widest text-destructive hover:underline"
                >
                  خالی کردن سبد
                </button>
              </div>

              <div className="space-y-4">
                {lines.map((line) => (
                  <div key={line.itemId} className="group relative flex gap-6 rounded-2xl border border-border bg-white p-5 transition-all duration-300 hover:shadow-premium hover:border-foreground/10">
                    <Link to="/product/$slug" params={{ slug: line.slug }} className="shrink-0 size-24 md:size-32 rounded-xl overflow-hidden bg-[#F9F9F9] border border-border">
                      <img
                        src={line.image ?? "/images/cat-toys.jpg"}
                        alt={line.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between gap-4">
                          <Link
                            to="/product/$slug"
                            params={{ slug: line.slug }}
                            className="text-base font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2 leading-relaxed"
                          >
                            {line.title}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem.mutate(line.itemId)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            title="حذف کالا"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {line.size && <span className="text-[11px] font-medium text-muted-foreground">سایز: {line.size}</span>}
                          {line.color && <span className="text-[11px] font-medium text-muted-foreground">رنگ: {line.color}</span>}
                          <span className="text-[11px] font-medium text-muted-foreground">کد: {toFaDigits(line.code)}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
                          <button
                            type="button"
                            onClick={() => setQty.mutate({ itemId: line.itemId, qty: line.qty + 1 })}
                            disabled={line.qty >= line.stock}
                            className="size-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
                          >
                            <Plus className="size-3.5" />
                          </button>
                          <span className="min-w-10 text-center text-sm font-bold">{toFaDigits(line.qty)}</span>
                          <button
                            type="button"
                            onClick={() => setQty.mutate({ itemId: line.itemId, qty: Math.max(line.qty - 1, 1) })}
                            className="size-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all"
                          >
                            <Minus className="size-3.5" />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{formatToman(line.lineTotal)}</div>
                          <div className="text-[10px] text-muted-foreground">واحد: {formatToman(line.price)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Sidebar */}
            <aside className="h-fit">
              <div className="sticky top-24 space-y-6 rounded-[24px] border border-border bg-white p-8 shadow-soft">
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-widest border-b border-border pb-4 mb-2">خلاصه خرید</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">قیمت کالاها ({toFaDigits(cart?.itemCount ?? 0)})</span>
                    <span className="font-bold text-gray-900">{formatToman(cart?.itemsTotal ?? 0)}</span>
                  </div>
                  
                  {cart && cart.savingsTotal > 0 && (
                    <div className="flex items-center justify-between text-sm text-destructive font-medium">
                      <span>سود شما از خرید</span>
                      <span className="font-bold">-{formatToman(cart.savingsTotal)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">هزینه ارسال</span>
                    <span className={cn("font-bold", cart?.shippingTotal === 0 ? "text-emerald-600" : "text-gray-900")}>
                      {cart?.shippingTotal === 0 ? "رایگان" : formatToman(cart?.shippingTotal ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  {cart && cart.remainingForFreeShipping > 0 ? (
                    <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3">
                      <Truck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[12px] leading-relaxed text-emerald-800">
                        با افزودن <strong>{formatToman(cart.remainingForFreeShipping)}</strong> کالای دیگر، ارسال سفارش شما <strong>رایگان</strong> خواهد شد.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3">
                      <Truck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[12px] leading-relaxed text-emerald-800">
                        سفارش شما با <strong>ارسال رایگان</strong> تحویل داده می‌شود!
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-8">
                    <span className="text-sm font-bold text-gray-900">مبلغ قابل پرداخت</span>
                    <span className="text-2xl font-bold text-gray-900">{formatToman(cart?.grandTotal ?? 0)}</span>
                  </div>

                  <Link
                    to="/checkout"
                    className="btn-primary w-full h-14 flex items-center justify-center text-[15px] font-bold"
                  >
                    ادامه فرایند خرید
                  </Link>
                  
                  <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground px-4">
                    کالاهای موجود در سبد خرید برای شما رزرو نشده‌اند. برای نهایی کردن، خرید خود را تکمیل کنید.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-2">
                <span className="text-[11px] text-muted-foreground">پشتیبانی تلفنی و واتس‌اپ:</span>
                <span className="text-sm font-bold text-gray-900">{business.phoneDisplay}</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </StoreShell>
  );
}