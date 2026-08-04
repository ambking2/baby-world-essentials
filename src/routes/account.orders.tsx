import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { formatJalali, formatToman, toFaDigits } from "@/lib/format";
import { getMyOrders } from "@/server/functions/orders";

export const Route = createFileRoute("/account/orders")({
  component: AccountOrders,
});

function AccountOrders() {
  const ordersQuery = useQuery({ queryKey: ["my-orders"], queryFn: () => getMyOrders() });
  const orders = ordersQuery.data?.orders ?? [];

  return (
    <div className="space-y-3">
      <h1 className="text-sm font-extrabold">سفارش‌های من</h1>

      {ordersQuery.isLoading ? (
        <div className="skeleton h-24 rounded-3xl" />
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center text-xs text-muted-foreground">
          هنوز سفارشی ثبت نکرده‌اید.
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.code} className="rounded-3xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold text-foreground">کد پیگیری {toFaDigits(order.code)}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatJalali(order.createdAt)} · {toFaDigits(order.items.length)} قلم · {order.paymentMethodLabel}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-[11px] font-bold text-brand">{order.statusLabel}</span>
                <span className="text-sm font-extrabold">{formatToman(order.grandTotal)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-2">
                {order.items.slice(0, 4).map((item, index) => (
                  <img
                    key={`${order.code}-${index}`}
                    src={item.image ?? "/images/cat-toys.jpg"}
                    alt={item.title}
                    className="size-12 rounded-xl object-cover"
                  />
                ))}
              </div>
              <Link
                to="/order/$code"
                params={{ code: order.code }}
                className="text-[11px] font-bold text-brand hover:underline"
              >
                جزئیات و پیگیری
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
