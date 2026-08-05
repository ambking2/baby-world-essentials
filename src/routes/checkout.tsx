import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BanknoteArrowUp, CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { checkCoupon, getCheckoutData, submitCheckout } from "@/server/functions/orders";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

type PaymentMethod = "card_transfer" | "cash_on_delivery";

function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [receiver, setReceiver] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("زنجان");
  const [city, setCity] = useState("ابهر");
  const [postalCode, setPostalCode] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card_transfer");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);

  const dataQuery = useQuery({ queryKey: ["checkout"], queryFn: () => getCheckoutData() });

  const tryCoupon = useMutation({
    mutationFn: () => checkCoupon({ data: { code: couponInput.trim() } }),
    onSuccess: (result) => {
      if (result.ok && result.code) {
        setCoupon({ code: result.code, discount: result.discount });
        toast.success(result.message);
      } else {
        setCoupon(null);
        toast.error(result.message);
      }
    },
  });

  const place = useMutation({
    mutationFn: () =>
      submitCheckout({
        data: {
          receiver,
          phone,
          province,
          city,
          addressLine,
          paymentMethod,
          ...(postalCode.trim().length > 0 ? { postalCode: postalCode.trim() } : {}),
          ...(note.trim().length > 0 ? { note: note.trim() } : {}),
          ...(coupon ? { couponCode: coupon.code } : {}),
        },
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: storeKeys.cart });
      void navigate({ to: "/order/$code", params: { code: result.code } });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "ثبت سفارش انجام نشد.";
      toast.error(message);
    },
  });

  const cart = dataQuery.data?.cart;
  const card = dataQuery.data?.card;
  const discount = coupon?.discount ?? 0;
  const payable = Math.max((cart?.grandTotal ?? 0) - discount, 0);

  const inputClass =
    "w-full rounded-sm border border-border bg-white px-3 py-3 text-[11px] font-medium text-gray-900 outline-none transition-all focus:border-gray-900";

  return (
    <StoreShell>
      <div className="container-page py-8">
        <h1 className="mb-8 text-xl font-bold text-foreground">تکمیل اطلاعات و پرداخت</h1>

        {cart && cart.lines.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground shadow-sm">
            سبد خرید شما خالی است؛ ابتدا کالایی انتخاب کنید.
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              place.mutate();
            }}
            className="grid gap-5 lg:grid-cols-[1fr_340px]"
          >
            <div className="space-y-5">
              <section className="space-y-6 rounded-xl border border-border bg-white p-6">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 border-b border-border pb-3">اطلاعات تحویل‌گیرنده</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    value={receiver}
                    onChange={(event) => setReceiver(event.target.value)}
                    placeholder="نام و نام خانوادگی"
                    className={inputClass}
                  />
                  <input
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="شمارهٔ موبایل"
                    inputMode="tel"
                    className={inputClass}
                  />
                  <input
                    required
                    value={province}
                    onChange={(event) => setProvince(event.target.value)}
                    placeholder="استان"
                    className={inputClass}
                  />
                  <input
                    required
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="شهر"
                    className={inputClass}
                  />
                  <input
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder="کد پستی (اختیاری)"
                    inputMode="numeric"
                    className={inputClass}
                  />
                </div>
                <textarea
                  required
                  value={addressLine}
                  onChange={(event) => setAddressLine(event.target.value)}
                  rows={3}
                  placeholder="نشانی دقیق پستی، همراه پلاک و واحد"
                  className={inputClass}
                />
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  placeholder="یادداشت برای فروشنده (اختیاری)"
                  className={inputClass}
                />
              </section>

              <section className="space-y-6 rounded-xl border border-border bg-white p-6">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 border-b border-border pb-3">روش پرداخت</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card_transfer")}
                    className={cn(
                      "flex items-start gap-3 rounded-sm border p-4 text-start transition-all duration-300",
                      paymentMethod === "card_transfer" ? "border-gray-900 bg-gray-50" : "border-border hover:border-gray-900",
                    )}
                  >
                    <CreditCard className="mt-0.5 size-4 text-gray-900" aria-hidden />
                    <span>
                      <span className="block text-xs font-extrabold">کارت‌به‌کارت</span>
                      <span className="mt-1 block text-[11px] leading-5 text-muted-foreground">
                        پس از ثبت سفارش، مبلغ را واریز و رسید را در همان صفحه ثبت کنید.
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                    className={cn(
                      "flex items-start gap-3 rounded-sm border p-4 text-start transition-all duration-300",
                      paymentMethod === "cash_on_delivery" ? "border-gray-900 bg-gray-50" : "border-border hover:border-gray-900",
                    )}
                  >
                    <BanknoteArrowUp className="mt-0.5 size-4 text-gray-900" aria-hidden />
                    <span>
                      <span className="block text-xs font-extrabold">پرداخت در محل</span>
                      <span className="mt-1 block text-[11px] leading-5 text-muted-foreground">
                        مناسب ارسال درون‌شهری و تحویل حضوری.
                      </span>
                    </span>
                  </button>
                </div>

                {paymentMethod === "card_transfer" && card ? (
                  <div className="rounded-xl bg-secondary/30 p-4 text-[11px] leading-6 border border-border/50">
                    <p className="font-extrabold text-foreground">شمارهٔ کارت: {toFaDigits(card.number)}</p>
                    <p className="text-muted-foreground">به نام {card.holder} · {card.bank}</p>
                  </div>
                ) : null}
              </section>
            </div>

            <aside className="h-fit space-y-6 rounded-xl border border-border bg-white p-6 lg:sticky lg:top-24">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 border-b border-border pb-3">خلاصهٔ پرداخت</h2>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">جمع کالاها ({toFaDigits(cart?.itemCount ?? 0)})</span>
                  <span className="font-bold">{formatToman(cart?.itemsTotal ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">هزینهٔ ارسال</span>
                  <span className="font-bold">
                    {cart && cart.shippingTotal === 0 ? "رایگان" : formatToman(cart?.shippingTotal ?? 0)}
                  </span>
                </div>
                {discount > 0 ? (
                  <div className="flex items-center justify-between text-primary font-bold">
                    <span>کد تخفیف {coupon?.code}</span>
                    <span className="font-bold">{formatToman(discount)}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="کد تخفیف"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => tryCoupon.mutate()}
                  disabled={couponInput.trim().length < 2 || tryCoupon.isPending}
                  className="shrink-0 rounded-sm border border-gray-900 px-3 text-[10px] font-bold uppercase transition-all duration-300 hover:bg-gray-900 hover:text-white disabled:opacity-50"
                >
                  اعمال
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-extrabold">مبلغ قابل پرداخت</span>
                <span className="text-base font-bold text-gray-900">{formatToman(payable)}</span>
              </div>

              <button
                type="submit"
                disabled={place.isPending}
                className="w-full rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-premium disabled:opacity-60"
              >
                {place.isPending ? "در حال ثبت سفارش…" : "ثبت نهایی سفارش"}
              </button>
            </aside>
          </form>
        )}
      </div>
    </StoreShell>
  );
}
