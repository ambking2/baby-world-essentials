import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BanknoteArrowUp,
  Check,
  Copy,
  CreditCard,
  Headphones,
  Lock,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { business } from "@/data/business";
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
    "w-full rounded-full border-[1.5px] border-outline-variant bg-surface-container-lowest px-5 py-3 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/15";

  const stepCard = "rounded-xl bg-surface-container-lowest p-6 shadow-[0_4px_20px_rgba(0,75,209,0.06)] md:p-8";

  return (
    <StoreShell>
      {/* Stepper band */}
      <div className="border-b bg-surface-container-low py-6">
        <div className="relative mx-auto flex max-w-3xl items-center justify-between px-8">
          <span className="absolute left-10 right-10 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-variant" />
          <span className="absolute right-10 top-1/2 h-1.5 w-1/2 -translate-y-1/2 rounded-full bg-gradient-to-l from-primary to-primary-container" />
          {[
            { label: "سبد خرید", done: true },
            { label: "اطلاعات و پرداخت", done: false },
            { label: "پایان", done: false },
          ].map((step) => (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-full text-sm font-bold",
                  step.done
                    ? "bg-primary text-on-primary"
                    : "border-2 border-outline-variant bg-surface-container-lowest text-outline",
                )}
              >
                {step.done ? <Check className="size-5" /> : toFaDigits(step.label === "پایان" ? 3 : 2)}
              </span>
              <span className={cn("text-[12px] font-bold", step.done ? "text-on-surface-variant" : "text-primary")}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-container-max grow px-4 py-10 sm:px-6">
        <h1 className="font-headline-md text-headline-md mb-8 text-on-surface">تکمیل اطلاعات و پرداخت</h1>

        {cart && cart.lines.length === 0 ? (
          <div className="card-soft mx-auto max-w-xl rounded-xl p-12 text-center text-sm text-on-surface-variant">
            سبد خرید شما خالی است؛ ابتدا کالایی انتخاب کنید.
            <div>
              <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/25">
                رفتن به فروشگاه
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              place.mutate();
            }}
            className="grid items-start gap-8 lg:grid-cols-12"
          >
            {/* Primary column */}
            <div className="space-y-8 lg:col-span-8">
              {/* Receiver + address */}
              <section className={stepCard}>
                <div className="mb-6 flex items-center gap-3 border-b border-surface-container pb-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
                    <MapPin className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">نشانی تحویل سفارش</h2>
                    <p className="text-[12px] text-on-surface-variant">اطلاعات گیرنده و آدرس پستی را وارد کنید</p>
                  </div>
                </div>
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
                  className={cn(inputClass, "mt-3 rounded-2xl")}
                />
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  placeholder="یادداشت برای فروشنده (اختیاری)"
                  className={cn(inputClass, "mt-3 rounded-2xl")}
                />
              </section>

              {/* Payment method — radio cards */}
              <section className={stepCard}>
                <div className="mb-6 flex items-center gap-3 border-b border-surface-container pb-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
                    <Wallet className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">روش پرداخت</h2>
                    <p className="text-[12px] text-on-surface-variant">یکی از روش‌های امن زیر را انتخاب کنید</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card_transfer")}
                    className={cn(
                      "flex w-full flex-col justify-between gap-3 rounded-lg border-2 p-5 text-start transition-all md:flex-row md:items-center",
                      paymentMethod === "card_transfer"
                        ? "border-primary bg-primary-fixed/15"
                        : "border-surface-container hover:border-outline-variant",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className={cn("flex size-5 items-center justify-center rounded-full border-2", paymentMethod === "card_transfer" ? "border-primary" : "border-outline-variant")}>
                        {paymentMethod === "card_transfer" ? <span className="size-2.5 rounded-full bg-primary" /> : null}
                      </span>
                      <span className="flex size-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
                        <CreditCard className="size-6" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-on-surface">کارت‌به‌کارت</span>
                        <span className="mt-0.5 block text-[12px] leading-5 text-on-surface-variant">
                          پس از ثبت سفارش مبلغ را واریز و رسید را ثبت کنید.
                        </span>
                      </span>
                    </span>
                    {paymentMethod === "card_transfer" ? (
                      <span className="self-start rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-on-secondary md:self-center">
                        پیشنهادی و سریع
                      </span>
                    ) : null}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                    className={cn(
                      "flex w-full flex-col justify-between gap-3 rounded-lg border-2 p-5 text-start transition-all md:flex-row md:items-center",
                      paymentMethod === "cash_on_delivery"
                        ? "border-primary bg-primary-fixed/15"
                        : "border-surface-container hover:border-outline-variant",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className={cn("flex size-5 items-center justify-center rounded-full border-2", paymentMethod === "cash_on_delivery" ? "border-primary" : "border-outline-variant")}>
                        {paymentMethod === "cash_on_delivery" ? <span className="size-2.5 rounded-full bg-primary" /> : null}
                      </span>
                      <span className="flex size-12 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
                        <BanknoteArrowUp className="size-6" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-on-surface">پرداخت در محل</span>
                        <span className="mt-0.5 block text-[12px] leading-5 text-on-surface-variant">
                          مناسب ارسال درون‌شهری و تحویل حضوری.
                        </span>
                      </span>
                    </span>
                  </button>
                </div>

                {paymentMethod === "card_transfer" && card ? (
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-container-low p-4">
                    <div>
                      <p className="text-[11px] text-on-surface-variant">شمارهٔ کارت</p>
                      <p className="mt-0.5 font-mono text-sm font-bold tracking-wider text-on-surface select-all" dir="ltr">
                        {card.number}
                      </p>
                      <p className="mt-1 text-[11px] text-on-surface-variant">به نام {card.holder} · {card.bank}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard?.writeText(card.number);
                        toast.success("شمارهٔ کارت کپی شد");
                      }}
                      className="flex items-center gap-1.5 rounded-full border border-primary/30 px-4 py-2 text-[12px] font-bold text-primary transition-colors hover:bg-primary-fixed"
                    >
                      <Copy className="size-3.5" />
                      کپی
                    </button>
                  </div>
                ) : null}
              </section>
            </div>

            {/* Summary sidebar */}
            <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24">
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-[0_4px_24px_rgba(0,75,209,0.08)]">
                <div className="mb-4 flex items-center justify-between border-b border-surface-container pb-3">
                  <h2 className="font-label-md text-label-md font-bold text-on-surface">خلاصهٔ پرداخت</h2>
                  <Link to="/cart" className="text-[12px] font-bold text-primary hover:underline">
                    ویرایش اقلام
                  </Link>
                </div>

                {/* Item thumbnails */}
                <div className="mb-4 max-h-56 space-y-2 overflow-y-auto hide-scrollbar">
                  {(cart?.lines ?? []).map((line) => (
                    <div key={line.itemId} className="flex items-center gap-3 rounded-lg bg-surface-container-low p-2">
                      <img
                        src={line.image ?? "/images/cat-toys.jpg"}
                        alt={line.title}
                        className="size-14 rounded-lg border border-surface-container-lowest bg-surface-container-lowest object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[12px] font-bold text-on-surface">{line.title}</p>
                        <p className="text-[11px] text-on-surface-variant">{toFaDigits(line.qty)} × {formatToman(line.unitPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">جمع کالاها ({toFaDigits(cart?.itemCount ?? 0)})</span>
                    <span className="font-bold text-on-surface">{formatToman(cart?.itemsTotal ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">هزینهٔ ارسال</span>
                    {cart?.shippingTotal === 0 ? (
                      <span className="rounded-full bg-primary-fixed px-2.5 py-0.5 text-[11px] font-bold text-primary">رایگان (طرح ویژه)</span>
                    ) : (
                      <span className="font-bold text-on-surface">{formatToman(cart?.shippingTotal ?? 0)}</span>
                    )}
                  </div>
                  {discount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant">کد تخفیف {coupon?.code}</span>
                      <span className="font-bold text-secondary">{formatToman(discount)}-</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2 py-3">
                  <input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    placeholder="کد تخفیف"
                    className="h-11 min-w-0 flex-1 rounded-full border-[1.5px] border-outline-variant bg-surface-container-low px-4 text-[13px] outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => tryCoupon.mutate()}
                    disabled={couponInput.trim().length < 2 || tryCoupon.isPending}
                    className="h-11 shrink-0 rounded-full bg-primary px-5 text-[12px] font-bold text-on-primary shadow-md shadow-primary/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    اعمال
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-outline-variant pt-4">
                  <span className="text-sm font-bold text-on-surface">مبلغ قابل پرداخت</span>
                  <span className="font-price-display text-price-display text-primary">{formatToman(payable)}</span>
                </div>

                <button
                  type="submit"
                  disabled={place.isPending}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container py-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
                >
                  <Lock className="size-4" />
                  {place.isPending ? "در حال ثبت سفارش…" : "ثبت نهایی و پرداخت"}
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: ShieldCheck, label: "ضمانت اصالت" },
                  { icon: RefreshCcw, label: "بازگشت ۷ روزه" },
                  { icon: Lock, label: "پرداخت امن" },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center gap-1.5 rounded-lg bg-surface-container-low/70 p-3 text-center">
                    <b.icon className="size-5 text-primary" />
                    <span className="text-[10px] font-bold text-on-surface">{b.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-surface-container-low p-4">
                <Headphones className="size-5 shrink-0 text-primary" />
                <p className="text-[12px] leading-5 text-on-surface-variant">
                  سؤالی دارید؟ با کارشناسان ما تماس بگیرید:{" "}
                  <span className="font-bold text-primary" dir="ltr">{business.phoneDisplay}</span>
                </p>
              </div>
            </aside>
          </form>
        )}
      </div>
    </StoreShell>
  );
}
