import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Pagination } from "@/components/store/Pagination";
import { formatJalaliTime, formatToman, toFaDigits } from "@/lib/format";
import { getAdminOrder, getAdminOrders, reviewAdminPayment, setAdminOrderStatus } from "@/@/lib/admin.functions";

type OrdersSearch = { status?: string; q?: string };

export const Route = createFileRoute("/admin/orders")({
  validateSearch: (search: Record<string, unknown>): OrdersSearch => ({
    ...(typeof search["status"] === "string" ? { status: search["status"] as string } : {}),
    ...(typeof search["q"] === "string" ? { q: search["q"] as string } : {}),
  }),
  component: AdminOrders,
});

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "در انتطار پرداخت",
  awaiting_review: "در انتطار بررسی رسید",
  paid: "پرداخت‌شده",
  processing: "در حال آماده‌سازی",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  canceled: "لغو شده",
};

function paymentStatusLabel(status: string): string {
  return status === "approved" ? "تأیید‌شده" : status === "rejected" ? "ردشده" : "در انتطار بررسی";
}

function AdminOrders() {
  const initial = Route.useSearch();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState(initial.status ?? "");
  const [term, setTerm] = useState(initial.q ?? "");
  const [appliedTerm, setAppliedTerm] = useState(initial.q ?? "");
  const [page, setPage] = useState(1);
  const [openCode, setOpenCode] = useState<string | null>(initial.q ?? null);
  const [note, setNote] = useState("");

  const ordersQuery = useQuery({
    queryKey: ["admin-orders", status, appliedTerm, page],
    queryFn: () =>
      getAdminOrders({
        data: {
          page,
          ...(status.length > 0 ? { status } : {}),
          ...(appliedTerm.trim().length > 0 ? { q: appliedTerm.trim() } : {}),
        },
      }),
  });

  const detailQuery = useQuery({
    queryKey: ["admin-order", openCode ?? ""],
    queryFn: () => getAdminOrder({ data: { code: openCode ?? "" } }),
    enabled: openCode !== null,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-order"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const changeStatus = useMutation({
    mutationFn: (input: { code: string; status: string }) => setAdminOrderStatus({ data: input }),
    onSuccess: (result) => {
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      refresh();
    },
  });

  const reviewPayment = useMutation({
    mutationFn: (input: { paymentId: number; approve: boolean }) =>
      reviewAdminPayment({
        data: {
          paymentId: input.paymentId,
          approve: input.approve,
          ...(note.trim().length > 0 ? { adminNote: note.trim() } : {}),
        },
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      setNote("");
      refresh();
    },
  });

  const items = ordersQuery.data?.items ?? [];
  const statuses = ordersQuery.data?.statuses ?? [];
  const order = detailQuery.data?.order ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-border bg-card p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedTerm(term);
            setPage(1);
          }}
          className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3 py-2"
        >
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="جستجو با کد سفارش، نام یا شماره…"
            className="w-full bg-transparent text-xs outline-none"
          />
        </form>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
        >
          <option value="">همهٔ وضعیت‌ها</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value] ?? value}
            </option>
          ))}
        </select>

        <span className="text-[11px] text-muted-foreground">مجموع: {toFaDigits(ordersQuery.data?.total ?? 0)}</span>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card p-4">
        <table className="w-full min-w-[760px] text-[11px]">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-2 text-start font-bold">کد</th>
              <th className="p-2 text-start font-bold">خریدار</th>
              <th className="p-2 text-start font-bold">تلفن</th>
              <th className="p-2 text-start font-bold">اقلام</th>
              <th className="p-2 text-start font-bold">مبلغ</th>
              <th className="p-2 text-start font-bold">پرداخت</th>
              <th className="p-2 text-start font-bold">وضعیت</th>
              <th className="p-2 text-start font-bold">تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.code} className="border-b border-border/60 last:border-0">
                <td className="p-2 font-extrabold">
                  <button type="button" onClick={() => setOpenCode(row.code)} className="hover:text-brand">
                    {toFaDigits(row.code)}
                  </button>
                </td>
                <td className="p-2">{row.receiver}</td>
                <td className="p-2 text-muted-foreground">{toFaDigits(row.phone)}</td>
                <td className="p-2">{toFaDigits(row.itemCount)}</td>
                <td className="p-2 font-bold">{formatToman(row.grandTotal)}</td>
                <td className="p-2 text-muted-foreground">{row.paymentMethodLabel}</td>
                <td className="p-2">
                  <select
                    value={row.status}
                    onChange={(event) => changeStatus.mutate({ code: row.code, status: event.target.value })}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-[10px] outline-none focus:border-brand"
                  >
                    {statuses.map((value) => (
                      <option key={value} value={value}>
                        {STATUS_LABELS[value] ?? value}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 text-muted-foreground">{formatJalaliTime(row.createdAt)}</td>
              </tr>
            ))}
            {items.length === 0 && !ordersQuery.isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  سفارشی مطابق فیلتر پیدا نشد.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <Pagination page={page} pageCount={ordersQuery.data?.pageCount ?? 1} onChange={setPage} />
      </div>

      {openCode !== null ? (
        <section className="rounded-3xl border border-brand/40 bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-foreground">جزئیات سفارش {toFaDigits(openCode)}</h2>
            <button type="button" onClick={() => setOpenCode(null)} className="text-[11px] text-muted-foreground hover:text-sale">
              بستن
            </button>
          </div>

          {detailQuery.isLoading ? (
            <div className="skeleton h-24 rounded-2xl" />
          ) : !order ? (
            <p className="text-xs text-muted-foreground">سفارش پیدا نشد.</p>
          ) : (
            <div className="space-y-4 text-[11px] leading-6">
              <div className="grid gap-2 sm:grid-cols-2">
                <p className="text-muted-foreground">
                  تحویل‌گیرنده: <span className="font-bold text-foreground">{order.receiver}</span> · {toFaDigits(order.phone)}
                </p>
                <p className="text-muted-foreground">
                  {order.province}، {order.city} — {order.addressLine}
                  {order.postalCode ? ` (${toFaDigits(order.postalCode)})` : ""}
                </p>
                <p className="text-muted-foreground">روش پرداخت: {order.paymentMethodLabel}</p>
                <p className="text-muted-foreground">
                  مبلغ کل: <span className="font-extrabold text-brand">{formatToman(order.grandTotal)}</span>
                </p>
                {order.note ? <p className="text-muted-foreground sm:col-span-2">یادداشت مشتری: {order.note}</p> : null}
              </div>

              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={`${order.code}-${index}`} className="flex items-center justify-between gap-2 rounded-2xl bg-secondary p-2">
                    <span className="font-bold text-foreground">
                      {item.title}
                      {item.size ? ` · سایز ${item.size}` : ""}
                      {item.color ? ` · ${item.color}` : ""}
                    </span>
                    <span className="text-muted-foreground">
                      {toFaDigits(item.qty)} × {formatToman(item.unitPrice)} = {formatToman(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {order.payments.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-foreground">رسیدهای پرداخت</h3>
                  <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="یادداشت مدیر برای تأیید/رد رسید (اختیاری)"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[11px] outline-none focus:border-brand"
                  />

                  {order.payments.map((payment) => (
                    <div key={payment.id} className="space-y-3 rounded-2xl border border-border p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="grid flex-1 gap-1 sm:grid-cols-2">
                          <p className="text-muted-foreground">
                            شناسه رسید: <span className="font-bold text-foreground">{toFaDigits(payment.id)}</span>
                          </p>
                          <p className="text-muted-foreground">
                            وضعیت رسید: <span className="font-bold text-foreground">{paymentStatusLabel(payment.status)}</span>
                          </p>
                          <p className="text-muted-foreground">
                            نام پرداخت‌کننده: <span className="font-bold text-foreground">{payment.payerName ?? "-"}</span>
                          </p>
                          <p className="text-muted-foreground">
                            شماره پیگیری: <span className="font-bold text-foreground">{toFaDigits(payment.reference ?? "-")}</span>
                          </p>
                          <p className="text-muted-foreground">
                            زمان اعلامی مشتری: <span className="font-bold text-foreground">{payment.paidAtText ?? "-"}</span>
                          </p>
                          <p className="text-muted-foreground">
                            زمان ثبت در سایت: <span className="font-bold text-foreground">{formatJalaliTime(payment.createdAt)}</span>
                          </p>
                          <p className="text-muted-foreground">
                            مبلغ: <span className="font-bold text-foreground">{formatToman(payment.amount)}</span>
                          </p>
                          <p className="text-muted-foreground">
                            روش: <span className="font-bold text-foreground">{payment.method === "card_transfer" ? "کارت‌به‌کارت" : payment.method}</span>
                          </p>
                        </div>

                        {payment.receiptUrl ? (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold hover:border-brand hover:text-brand"
                          >
                            <ExternalLink className="size-3" aria-hidden />
                            مشاهده رسید
                          </a>
                        ) : null}
                      </div>

                      {payment.receiptUrl ? (
                        <a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-border bg-secondary">
                          <img src={payment.receiptUrl} alt="رسید پرداخت" className="max-h-72 w-full object-contain" />
                        </a>
                      ) : null}

                      {payment.adminNote ? (
                        <p className="rounded-xl bg-secondary px-3 py-2 text-muted-foreground">
                          یادداشت مدیر: <span className="font-bold text-foreground">{payment.adminNote}</span>
                        </p>
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={reviewPayment.isPending}
                          onClick={() => reviewPayment.mutate({ paymentId: payment.id, approve: true })}
                          className="rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-white disabled:opacity-60 hover:bg-primary/95 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none shadow-sm"
                        >
                          تأیید این رسید
                        </button>
                        <button
                          type="button"
                          disabled={reviewPayment.isPending}
                          onClick={() => reviewPayment.mutate({ paymentId: payment.id, approve: false })}
                          className="rounded-full border border-border px-4 py-2 text-[11px] font-bold hover:border-sale hover:text-sale disabled:opacity-60 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                        >
                          رد این رسید
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {reviewPayment.isPending ? <p className="text-[10px] text-muted-foreground">در حال بررسی رسید…</p> : null}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
