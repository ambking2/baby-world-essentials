import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgePercent,
  CreditCard,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteCartItem, emptyCart, getCart, updateCartItemQty } from "@/server/functions/cart";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartStepper() {
  const steps = ["سبد خرید", "نشانی و ارسال", "پرداخت"];
  return (
    <div className="mb-8 flex items-center justify-center gap-2 rounded-lg border border-surface-container-high bg-surface-container-lowest p-3 shadow-sm">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-[12px] font-bold",
              i === 0 ? "bg-primary text-on-primary shadow-md shadow-primary/30" : "bg-surface-container text-on-surface-variant",
            )}
          >
            {toFaDigits(i + 1)}
          </span>
          <span className={cn("text-[12px] font-bold", i === 0 ? "text-primary" : "text-on-surface-variant")}>{label}</span>
          {i < steps.length - 1 ? <span className="mx-2 hidden h-0.5 w-8 rounded bg-surface-container-high sm:block" /> : null}
        </div>
      ))}
    </div>
  );
}

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

  const threshold = business.freeShippingThreshold ?? 0;
  const progressPct = threshold > 0 ? Math.min(100, Math.round(((cart?.itemsTotal ?? 0) / threshold) * 100)) : 100;

  return (
    <StoreShell>
      <div className="container-page py-8">
        {/* Page header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-headline-md text-headline-md text-on-surface">
            سبد خرید {cart?.itemCount ? <span className="text-on-surface-variant">({toFaDigits(cart.itemCount)} کالا)</span> : null}
          </h1>
          {lines.length > 0 ? (
            <button
              type="button"
              onClick={() => clearAll.mutate()}
              className="flex items-center gap-2 rounded-full bg-secondary-fixed/60 px-4 py-2 text-[12px] font-bold text-secondary transition-colors hover:bg-secondary-fixed"
            >
              <Trash2 className="size-4" />
              خالی کردن سبد
            </button>
          ) : null}
        </div>

        <CartStepper />

        {cartQuery.isLoading ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-32 rounded-lg" />
              ))}
            </div>
            <div className="skeleton h-[420px] rounded-xl" />
          </div>
        ) : lines.length === 0 ? (
          <div className="card-soft mx-auto max-w-2xl rounded-xl p-12 text-center md:p-16">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-surface-container-low">
              <ShoppingBag className="size-9 text-on-surface-variant" />
            </div>
            <h2 className="font-headline-sm text-headline-sm mb-3 font-bold text-on-surface">سبد خرید شما خالی است</h2>
            <p className="mx-auto mb-8 max-w-sm text-sm leading-7 text-on-surface-variant">
              هنوز محصولی به سبد اضافه نکرده‌اید. با انتخاب محصولات مورد نظر، خرید خود را آغاز کنید.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-3.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
            >
              مشاهدهٔ فروشگاه
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-12">
            {/* Items column */}
            <section className="flex flex-col gap-4 lg:col-span-8">
              {/* Free shipping meter */}
              <div className="card-soft relative overflow-hidden rounded-lg p-card-padding">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary-fixed text-primary">
                    <Truck className="size-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] text-on-surface">
                      {cart && cart.remainingForFreeShipping > 0 ? (
                        <>
                          تنها <strong className="text-primary">{formatToman(cart.remainingForFreeShipping)}</strong> دیگر به ارسال رایگان اضافه کنید
                        </>
                      ) : (
                        <strong className="text-primary">سفارش شما با ارسال رایگان تحویل داده می‌شود! 🎉</strong>
                      )}
                    </p>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-container">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-container transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="rounded-full bg-primary-fixed/60 px-2.5 py-1 text-[11px] font-bold text-primary">
                    ٪{toFaDigits(progressPct)}
                  </span>
                </div>
              </div>

              {/* Items */}
              {lines.map((line) => (
                <div
                  key={line.itemId}
                  className="soft-tactile card-soft group flex gap-4 rounded-lg p-4"
                >
                  <Link
                    to="/product/$slug"
                    params={{ slug: line.slug }}
                    className="size-24 shrink-0 overflow-hidden rounded-lg bg-surface-container-low md:size-28"
                  >
                    <img
                      src={line.image ?? "/images/cat-toys.jpg"}
                      alt={line.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to="/product/$slug"
                          params={{ slug: line.slug }}
                          className="line-clamp-2 text-sm font-bold text-on-surface transition-colors hover:text-primary"
                        >
                          {line.title}
                        </Link>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-on-surface-variant">
                          {line.size ? <span>سایز: {line.size}</span> : null}
                          {line.color ? <span>رنگ: {line.color}</span> : null}
                          <span>کد: {toFaDigits(line.code)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem.mutate(line.itemId)}
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
                        title="حذف کالا"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      {/* Capsule qty stepper */}
                      <div className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-1.5 py-1 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setQty.mutate({ itemId: line.itemId, qty: line.qty + 1 })}
                          disabled={line.qty >= line.stock}
                          className="flex size-7 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm transition-transform hover:scale-110 active:scale-90 disabled:opacity-40"
                          aria-label="افزایش"
                        >
                          <Plus className="size-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-extrabold">{toFaDigits(line.qty)}</span>
                        <button
                          type="button"
                          onClick={() => setQty.mutate({ itemId: line.itemId, qty: Math.max(line.qty - 1, 1) })}
                          className="flex size-7 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm transition-transform hover:scale-110 active:scale-90"
                          aria-label="کاهش"
                        >
                          <Minus className="size-3.5" />
                        </button>
                      </div>

                      <div className="text-left">
                        <div className="font-price-display text-price-display text-primary">{formatToman(line.lineTotal)}</div>
                        <div className="text-[11px] text-on-surface-variant">واحد: {formatToman(line.unitPrice)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                to="/shop"
                className="self-start rounded-full border-2 border-primary px-6 py-2.5 text-[13px] font-bold text-primary transition-colors hover:bg-primary-fixed"
              >
                ادامهٔ خرید
              </Link>
            </section>

            {/* Summary sidebar */}
            <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24">
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_4px_24px_rgba(0,75,209,0.08)]">
                <h2 className="font-label-md text-label-md mb-4 border-b border-surface-container pb-3 font-bold text-on-surface">
                  خلاصهٔ سفارش
                </h2>

                <div className="space-y-3 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">جمع کالاها ({toFaDigits(cart?.itemCount ?? 0)})</span>
                    <span className="font-bold text-on-surface">{formatToman(cart?.itemsTotal ?? 0)}</span>
                  </div>
                  {cart && cart.savingsTotal > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">سود شما از تخفیف‌ها</span>
                      <span className="font-bold text-secondary">{formatToman(cart.savingsTotal)}-</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">هزینهٔ ارسال</span>
                    {cart?.shippingTotal === 0 ? (
                      <span className="rounded-full bg-primary-fixed px-2.5 py-0.5 text-[11px] font-bold text-primary">
                        رایگان (طرح ویژه)
                      </span>
                    ) : (
                      <span className="font-bold text-on-surface">{formatToman(cart?.shippingTotal ?? 0)}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-dashed border-outline-variant pt-4">
                  <span className="text-sm font-bold text-on-surface">مبلغ قابل پرداخت</span>
                  <span className="font-price-display text-price-display text-primary">{formatToman(cart?.grandTotal ?? 0)}</span>
                </div>

                <Link
                  to="/checkout"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container py-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-transform hover:scale-[1.01] active:scale-[0.98]"
                >
                  <CreditCard className="size-5" />
                  ادامهٔ فرایند خرید
                </Link>

                <p className="mt-4 text-center text-[11px] leading-5 text-on-surface-variant">
                  کالاهای سبد خرید رزرو نشده‌اند؛ برای نهایی کردن، خرید را تکمیل کنید.
                </p>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: ShieldCheck, label: "ضمانت اصالت" },
                  { icon: BadgePercent, label: "بهترین قیمت" },
                  { icon: Lock, label: "پرداخت امن" },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center gap-1.5 rounded-lg bg-surface-container-low/70 p-3 text-center">
                    <b.icon className="size-5 text-primary" />
                    <span className="text-[10px] font-bold text-on-surface">{b.label}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-surface-container-low p-4 text-center">
                <p className="text-[11px] text-on-surface-variant">پشتیبانی تلفنی و واتس‌اپ:</p>
                <p className="mt-1 text-sm font-bold text-primary" dir="ltr">{business.phoneDisplay}</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
