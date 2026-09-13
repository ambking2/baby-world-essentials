import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  ClipboardList,
  Home,
  PackageCheck,
  Receipt,
  Sparkles,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { formatJalali, formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getMyOrders } from "@/server/functions/orders";
import type { OrderStatus } from "@/server/repo/orders";

export const Route = createFileRoute("/account/orders")({
  component: AccountOrders,
});

type FilterKey = "all" | "pending" | "in_progress" | "shipped" | "delivered";

const FILTERS: Array<{ key: FilterKey; label: string; statuses: Array<string> }> = [
  { key: "all", label: "همه", statuses: [] },
  { key: "pending", label: "در انتظار پرداخت", statuses: ["pending_payment", "awaiting_review"] },
  { key: "in_progress", label: "در حال پردازش", statuses: ["paid", "processing"] },
  { key: "shipped", label: "ارسال‌شده", statuses: ["shipped"] },
  { key: "delivered", label: "تحویل‌شده", statuses: ["delivered"] },
];

const TRACK_STEPS = [
  { key: "register", label: "ثبت سفارش", icon: ClipboardList },
  { key: "process", label: "پردازش", icon: PackageCheck },
  { key: "ship", label: "ارسال", icon: Truck },
  { key: "deliver", label: "تحویل", icon: Home },
];

function stepIndex(status: string): number {
  if (["pending_payment", "awaiting_review"].includes(status)) return 0;
  if (["paid", "processing"].includes(status)) return 1;
  if (status === "shipped") return 2;
  if (status === "delivered") return 3;
  return -1;
}

function AccountOrders() {
  const ordersQuery = useQuery({ queryKey: ["my-orders"], queryFn: () => getMyOrders() });
  const [filter, setFilter] = useState<FilterKey>("all");

  const orders = ordersQuery.data?.orders ?? [];

  const counts = useMemo(() => {
    const map: Record<FilterKey, number> = { all: orders.length, pending: 0, in_progress: 0, shipped: 0, delivered: 0 };
    for (const order of orders) {
      for (const f of FILTERS) {
        if (f.key !== "all" && f.statuses.includes(order.status)) map[f.key] += 1;
      }
    }
    return map;
  }, [orders]);

  const visible = filter === "all" ? orders : orders.filter((o) => FILTERS.find((f) => f.key === filter)?.statuses.includes(o.status));
  const active = visible.find((o) => !["delivered", "canceled"].includes(o.status));
  const rest = visible.filter((o) => o !== active);

  return (
    <div className="space-y-8">
      <h1 className="font-headline-md text-headline-md font-bold text-on-surface">سفارش‌های من</h1>

      {/* Status filter pills */}
      <div className="card-soft flex flex-wrap gap-1.5 rounded-lg p-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold transition-all",
              filter === f.key
                ? "bg-primary text-on-primary shadow-sm shadow-primary/25"
                : "text-on-surface-variant hover:bg-surface-container-low",
            )}
          >
            {f.label}
            {counts[f.key] > 0 ? (
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                  filter === f.key ? "bg-white/25" : "bg-primary-fixed text-on-primary-fixed",
                )}
              >
                {toFaDigits(counts[f.key])}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {ordersQuery.isLoading ? (
        <div className="skeleton h-40 rounded-xl" />
      ) : visible.length === 0 ? (
        <div className="card-soft rounded-xl p-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-surface-container-low">
            <Receipt className="size-7 text-on-surface-variant" />
          </div>
          <p className="font-label-md text-label-md font-bold text-on-surface">هنوز سفارشی در این وضعیت ثبت نکرده‌اید.</p>
          <Link to="/shop" className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-[13px] font-bold text-on-primary shadow-md shadow-primary/25">
            شروع خرید
          </Link>
        </div>
      ) : null}

      {/* Active order with live tracker */}
      {active ? <ActiveOrderCard order={active} /> : null}

      {/* Rest of orders */}
      <div className="space-y-4">
        {rest.map((order) => {
          const done = order.status === "delivered";
          return (
            <div key={order.code} className="card-soft rounded-lg border p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn("flex size-10 items-center justify-center rounded-full", done ? "bg-surface-container-high text-tertiary" : "bg-surface-container-high text-on-surface-variant")}>
                    {done ? <Check className="size-5" /> : <Receipt className="size-5" />}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-on-surface">کد پیگیری {toFaDigits(order.code)}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {formatJalali(order.createdAt)} · {toFaDigits(order.items.length)} قلم · {order.paymentMethodLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-[11px] font-bold text-tertiary">
                    <span className="size-1.5 rounded-full bg-tertiary" />
                    {order.statusLabel}
                  </span>
                  <span className="font-price-display text-price-display text-primary">{formatToman(order.grandTotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {order.items.slice(0, 4).map((item, index) => (
                  <div key={`${order.code}-${index}`} className="flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
                    <img src={item.image ?? "/images/cat-toys.jpg"} alt={item.title} className="size-12 rounded-lg object-cover" />
                    <p className="line-clamp-2 text-[12px] font-semibold text-on-surface">{item.title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-surface-container pt-4">
                <Link
                  to="/order/$code"
                  params={{ code: order.code }}
                  className="rounded-full border border-primary/30 px-5 py-2 text-[12px] font-bold text-primary transition-colors hover:bg-primary-fixed"
                >
                  جزئیات سفارش
                </Link>
                {done ? (
                  <Link to="/shop" className="rounded-full bg-surface-container px-5 py-2 text-[12px] font-bold text-on-surface transition-colors hover:bg-primary-fixed hover:text-primary">
                    <span className="flex items-center gap-1.5"><Sparkles className="size-3.5" /> خرید مجدد</span>
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActiveOrderCard({ order }: { order: Awaited<ReturnType<typeof getMyOrders>>["orders"][number] }) {
  const idx = stepIndex(order.status);
  const pct = Math.max(0, (idx / (TRACK_STEPS.length - 1)) * 100);

  return (
    <div className="overflow-hidden rounded-lg border-2 border-primary/20 bg-surface-container-lowest shadow-[0_4px_24px_rgba(0,75,209,0.06)]">
      {/* Gradient ribbon header */}
      <div className="border-b bg-gradient-to-l from-primary-fixed/50 via-surface-container-low to-surface-container-lowest p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold text-on-surface-variant">رهگیری زندهٔ سفارش</p>
            <p className="font-headline-sm text-headline-sm mt-1 font-bold text-on-surface">
              کد پیگیری <span className="select-all tracking-wider text-primary" dir="ltr">{toFaDigits(order.code)}</span>
            </p>
          </div>
          <span className="rounded-full bg-primary px-4 py-1.5 text-[12px] font-bold text-on-primary shadow-md shadow-primary/25">
            {order.statusLabel}
          </span>
        </div>
      </div>

      {/* 4-step tracker */}
      <div className="relative px-8 pb-2 pt-6">
        <span className="absolute left-10 right-10 top-12 h-2 rounded-full bg-surface-container-high" />
        <span className="absolute right-10 top-12 h-2 rounded-full bg-gradient-to-l from-primary to-primary-container transition-all duration-700" style={{ width: `calc((100% - 5rem) * ${pct / 100})` }} />
        <div className="relative grid grid-cols-4">
          {TRACK_STEPS.map((step, i) => {
            const reached = i <= idx;
            const current = i === idx;
            return (
              <div key={step.key} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full border-4 border-surface-container-lowest transition-all",
                    reached ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant",
                    current && "pulsing-ring",
                  )}
                >
                  {reached && !current ? <Check className="size-5" /> : <step.icon className="size-5" />}
                </span>
                <span className={cn("text-[11px] font-bold", current ? "text-primary" : reached ? "text-on-surface" : "text-on-surface-variant")}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courier / payment box */}
      <div className="mx-6 mb-6 mt-6 flex flex-col justify-between gap-3 rounded-lg border border-primary/15 bg-surface-container-low p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-fixed text-primary">
            <Truck className="size-5" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-on-surface">روش پرداخت: {order.paymentMethodLabel}</p>
            <p className="text-[12px] text-on-surface-variant">
              {order.status === "pending_payment" ? "منتظر واریز شماست — رسید را در صفحهٔ سفارش ثبت کنید." : "سفارش پس از تأیید پرداخت پردازش می‌شود."}
            </p>
          </div>
        </div>
        <Link
          to="/order/$code"
          params={{ code: order.code }}
          className="self-start rounded-full bg-primary px-6 py-2.5 text-[13px] font-bold text-on-primary shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 md:self-center"
        >
          مشاهدهٔ رسید و جزئیات
        </Link>
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 gap-3 px-6 pb-6 md:grid-cols-2">
        {order.items.slice(0, 4).map((item, index) => (
          <div key={`${order.code}-${index}`} className="flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
            <img src={item.image ?? "/images/cat-toys.jpg"} alt={item.title} className="size-12 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="line-clamp-1 text-[12px] font-semibold text-on-surface">{item.title}</p>
              <p className="text-[11px] text-on-surface-variant">{toFaDigits(item.qty ?? 1)} عدد</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-surface-container p-5">
        <span className="text-[13px] font-bold text-on-surface">
          مبلغ کل: <span className="font-price-display text-price-display text-primary">{formatToman(order.grandTotal)}</span>
        </span>
        <span className="text-[11px] text-on-surface-variant">{formatJalali(order.createdAt)}</span>
      </div>
    </div>
  );
}
