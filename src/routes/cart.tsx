import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";
import { deleteCartItem, emptyCart, getCart, updateCartItemQty } from "@/server/functions/cart";

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
      <div className="container-page py-8">
        <h1 className="mb-5 text-xl font-extrabold text-foreground">سبد خرید</h1>

        {cartQuery.isLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-24 rounded-3xl" />
            <div className="skeleton h-24 rounded-3xl" />
          </div>
        ) : lines.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <ShoppingBag className="mx-auto mb-3 size-10 text-brand" aria-hidden />
            <p className="text-sm font-extrabold">سبد خرید شما خالی است</p>
            <p className="mt-2 text-xs text-muted-foreground">از میان دسته‌بندی‌های فروشگاه کالای مورد نیازتان را انتخاب کنید.</p>
            <Link
              to="/search"
              search={{ q: "" }}
              className="mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground"
            >
              شروع خرید
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {lines.map((line) => (
                <div key={line.itemId} className="flex gap-3 rounded-3xl border border-border bg-card p-3">
                  <Link to="/product/$slug" params={{ slug: line.slug }} className="shrink-0">
                    <img
                      src={line.image ?? "/images/cat-toys.jpg"}
                      alt={line.title}
                      className="size-24 rounded-2xl object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to="/product/$slug"
                      params={{ slug: line.slug }}
                      className="line-clamp-2 text-sm font-extrabold text-foreground hover:text-brand"
                    >
                      {line.title}
                    </Link>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      کد: {toFaDigits(line.code)}
                      {line.size ? ` · سایز ${line.size}` : ""}
                      {line.color ? ` · رنگ ${line.color}` : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 rounded-xl border border-border p-1">
                        <button
                          type="button"
                          onClick={() => setQty.mutate({ itemId: line.itemId, qty: line.qty + 1 })}
                          disabled={line.qty >= line.stock}
                          className="grid size-7 place-items-center rounded-lg hover:bg-secondary disabled:opacity-40"
                          aria-label="افزایش"
                        >
                          <Plus className="size-3.5" aria-hidden />
                        </button>
                        <span className="min-w-7 text-center text-xs font-extrabold">{toFaDigits(line.qty)}</span>
                        <button
                          type="button"
                          onClick={() => setQty.mutate({ itemId: line.itemId, qty: Math.max(line.qty - 1, 1) })}
                          className="grid size-7 place-items-center rounded-lg hover:bg-secondary"
                          aria-label="کاهش"
                        >
                          <Minus className="size-3.5" aria-hidden />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-foreground">{formatToman(line.lineTotal)}</span>
                        <button
                          type="button"
                          onClick={() => removeItem.mutate(line.itemId)}
                          className="text-muted-foreground transition-colors hover:text-sale"
                          aria-label="حذف کالا"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => clearAll.mutate()}
                className="text-xs text-muted-foreground hover:text-sale"
              >
                خالی کردن سبد خرید
              </button>
            </div>

            <aside className="h-fit space-y-3 rounded-3xl border border-border bg-card p-5 lg:sticky lg:top-24">
              <h2 className="text-sm font-extrabold">خلاصهٔ سفارش</h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">جمع کالاها ({toFaDigits(cart?.itemCount ?? 0)})</span>
                  <span className="font-bold">{formatToman(cart?.itemsTotal ?? 0)}</span>
                </div>
                {cart && cart.savingsTotal > 0 ? (
                  <div className="flex items-center justify-between text-sale">
                    <span>سود شما از تخفیف</span>
                    <span className="font-bold">{formatToman(cart.savingsTotal)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">هزینهٔ ارسال</span>
                  <span className="font-bold">
                    {cart && cart.shippingTotal === 0 ? "رایگان" : formatToman(cart?.shippingTotal ?? 0)}
                  </span>
                </div>
              </div>

              {cart && cart.remainingForFreeShipping > 0 ? (
                <p className="rounded-2xl bg-brand-soft p-3 text-[11px] leading-5 text-brand">
                  با {formatToman(cart.remainingForFreeShipping)} خرید بیشتر، ارسال رایگان می‌شود.
                </p>
              ) : null}

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-extrabold">مبلغ قابل پرداخت</span>
                <span className="text-base font-extrabold text-brand">{formatToman(cart?.grandTotal ?? 0)}</span>
              </div>

              <Link
                to="/checkout"
                className="flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                ادامهٔ ثبت سفارش
              </Link>
              <p className="text-[11px] leading-5 text-muted-foreground">
                پرداخت به صورت کارت‌به‌کارت یا پرداخت در محل انجام می‌شود. سوال دارید؟ {business.phoneDisplay}
              </p>
            </aside>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
