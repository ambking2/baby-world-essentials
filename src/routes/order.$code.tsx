import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StoreShell } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { formatJalaliTime, formatToman, toFaDigits } from "@/lib/format";
import { getOrder, submitReceipt } from "@/server/functions/orders";

export const Route = createFileRoute("/order/$code")({
  component: OrderPage,
});

function OrderPage() {
  const { code } = Route.useParams();
  const queryClient = useQueryClient();

  const [payerName, setPayerName] = useState("");
  const [reference, setReference] = useState("");
  const [paidAtText, setPaidAtText] = useState("");

  const orderQuery = useQuery({ queryKey: ["order", code], queryFn: () => getOrder({ data: { code } }) });

  const sendReceipt = useMutation({
    mutationFn: () => submitReceipt({ data: { orderCode: code, payerName, reference, paidAtText } }),
    onSuccess: (result) => {
      toast.success(result.message);
      setPayerName("");
      setReference("");
      setPaidAtText("");
      void queryClient.invalidateQueries({ queryKey: ["order", code] });
    },
    onError: () => toast.error("ثبت رسید انجام نشد؛ فیلدها را کامل کنید."),
  });

  const order = orderQuery.data?.order ?? null;
  const card = orderQuery.data?.card;

  const inputClass =
    "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-xs outline-none transition-colors focus:border-primary shadow-sm";

  if (orderQuery.isLoading) {
    return (
      <StoreShell>
        <div className="container-page py-10">
          <div className="skeleton h-40 rounded-3xl" />
        </div>
      </StoreShell>
    );
  }

  if (!order) {
    return (
      <StoreShell>
        <div className="container-page py-20 text-center">
          <h1 className="text-lg font-extrabold">سفارشی با این کد پیدا نشد</h1>
          <p className="mt-2 text-sm text-muted-foreground">کد پیگیری را باز بررسی کنید یا با {business.phoneDisplay} تماس بگیرید.</p>
          <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-premium">
            بازگشت به فروشگاه
          </Link>
        </div>
      </StoreShell>
    );
  }

  const needsReceipt = order.paymentMethod === "card_transfer" && order.status === "pending_payment";

  return (
    <StoreShell>
      <div className="container-page py-8">
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-5" aria-hidden />
            <h1 className="text-lg font-extrabold">سفارش شما ثبت شد</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            کد پیگیری: <span className="font-extrabold text-foreground">{toFaDigits(order.code)}</span> · وضعیت:{" "}
            <span className="font-bold text-primary">{order.statusLabel}</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">تاریخ ثبت: {formatJalaliTime(order.createdAt)}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-sm font-extrabold">کالاهای سفارش</h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={`${item.code ?? item.title}-${index}`} className="flex items-center gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <img
                      src={item.image ?? "/images/cat-toys.jpg"}
                      alt={item.title}
                      className="size-16 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-extrabold">{item.title}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {toFaDigits(item.qty)} عدد
                        {item.size ? ` · سایز ${item.size}` : ""}
                        {item.color ? ` · رنگ ${item.color}` : ""}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold">{formatToman(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white p-6 shadow-sm text-xs leading-6">
              <h2 className="mb-3 text-sm font-extrabold">اطلاعات تحویل</h2>
              <p className="text-muted-foreground">
                {order.receiver} · {toFaDigits(order.phone)}
              </p>
              <p className="text-muted-foreground">
                {order.province}، {order.city} — {order.addressLine}
                {order.postalCode ? ` (کد پستی ${toFaDigits(order.postalCode)})` : ""}
              </p>
              {order.note ? <p className="mt-1 text-muted-foreground">یادداشت: {order.note}</p> : null}
            </section>

            {needsReceipt && card ? (
              <section className="space-y-6 rounded-2xl border border-primary/30 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold border-b border-border pb-2">پرداخت کارت‌به‌کارت و ثبت رسید</h2>
                <div className="flex flex-wrap items-center gap-4 rounded-xl bg-secondary/30 p-4 text-[11px] leading-6 border border-border/50">
                  <span className="font-extrabold text-foreground">{toFaDigits(card.number)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(card.number.replace(/[^0-9]/g, ""));
                      toast.success("شمارهٔ کارت کپی شد.");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] hover:border-primary hover:text-primary transition-colors bg-white shadow-sm"
                  >
                    <Copy className="size-3" aria-hidden />
                    کپی
                  </button>
                  <span className="text-muted-foreground">
                    به نام {card.holder} · {card.bank}
                  </span>
                  <span className="w-full font-bold text-primary">مبلغ قابل واریز: {formatToman(order.grandTotal)}</span>
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendReceipt.mutate();
                  }}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  <input
                    required
                    value={payerName}
                    onChange={(event) => setPayerName(event.target.value)}
                    placeholder="نام پرداخت‌کننده"
                    className={inputClass}
                  />
                  <input
                    required
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="شمارهٔ پیگیری واریز"
                    className={inputClass}
                  />
                  <input
                    required
                    value={paidAtText}
                    onChange={(event) => setPaidAtText(event.target.value)}
                    placeholder="تاریخ و ساعت واریز"
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    disabled={sendReceipt.isPending}
                    className="rounded-full bg-primary px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-premium disabled:opacity-60 sm:col-span-3"
                  >
                    {sendReceipt.isPending ? "در حال ثبت…" : "ثبت رسید پرداخت"}
                  </button>
                </form>
              </section>
            ) : null}

            {order.payments.length > 0 ? (
              <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-sm font-extrabold">رسیدهای ثبت‌شده</h2>
                <div className="space-y-2 text-[11px] leading-6">
                  {order.payments.map((payment, index) => (
                    <div key={`${payment.reference ?? "payment"}-${index}`} className="rounded-2xl border border-border p-3">
                      <p className="text-muted-foreground">
                        {payment.payerName} · پیگیری {toFaDigits(payment.reference ?? "-")} · {payment.paidAtText}
                      </p>
                      <p className="mt-1 font-bold text-foreground">
                        وضعیت بررسی:{" "}
                        {payment.status === "approved" ? "تأیید شده" : payment.status === "rejected" ? "رد شده" : "در انتظار بررسی"}
                      </p>
                      {payment.adminNote ? <p className="text-muted-foreground">یادداشت مدیر: {payment.adminNote}</p> : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm text-xs">
            <h2 className="text-sm font-bold border-b border-border pb-2">صورتحساب</h2>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">جمع کالاها</span>
              <span className="font-bold">{formatToman(order.itemsTotal)}</span>
            </div>
            {order.discountTotal > 0 ? (
              <div className="flex items-center justify-between text-primary font-bold">
                <span>تخفیف {order.couponCode ?? ""}</span>
                <span className="font-bold">{formatToman(order.discountTotal)}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ارسال</span>
              <span className="font-bold">{order.shippingTotal === 0 ? "رایگان" : formatToman(order.shippingTotal)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-extrabold">مبلغ کل</span>
              <span className="text-base font-bold text-primary">{formatToman(order.grandTotal)}</span>
            </div>
            <p className="pt-2 text-[11px] leading-6 text-muted-foreground">
              روش پرداخت: {order.paymentMethodLabel}
              <br />
              پیگیری تلفنی: {business.phoneDisplay}
            </p>
          </aside>
        </div>
      </div>
    </StoreShell>
  );
}
