import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Boxes, Coins, Receipt, ShoppingBag, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatJalali, formatToman, toFaDigits } from "@/lib/format";
import { getAdminDashboard } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const dashboardQuery = useQuery({ queryKey: ["admin-dashboard"], queryFn: () => getAdminDashboard() });

  const stats = dashboardQuery.data?.stats;
  const orders = dashboardQuery.data?.latestOrders ?? [];

  const chartData = (stats?.revenueByDay ?? []).map((row) => ({
    day: formatJalali(row.day),
    revenue: Math.round(row.revenue / 1_000_000),
    orders: row.orders,
  }));

  const cards = [
    { label: "درامد کل (تأیید‌شده)", value: formatToman(stats?.revenue ?? 0), icon: Coins, tone: "text-brand" },
    { label: "درامد امروز", value: formatToman(stats?.todayRevenue ?? 0), icon: Receipt, tone: "text-fresh" },
    { label: "تعداد سفارش‌ها", value: toFaDigits(stats?.orderCount ?? 0), icon: ShoppingBag, tone: "text-foreground" },
    { label: "مشتریان", value: toFaDigits(stats?.customerCount ?? 0), icon: Users, tone: "text-foreground" },
    { label: "محصولات فعال", value: toFaDigits(stats?.productCount ?? 0), icon: Boxes, tone: "text-foreground" },
    { label: "موجودی کم (۲ و کمتر)", value: toFaDigits(stats?.lowStockCount ?? 0), icon: AlertTriangle, tone: "text-sale" },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{card.label}</p>
              <card.icon className={`size-4 ${card.tone}`} aria-hidden />
            </div>
            <p className={`mt-2 text-lg font-extrabold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          to="/admin/orders"
          search={{ status: "awaiting_review" }}
          className="rounded-3xl border border-primary/20 bg-secondary/30 p-4 text-xs font-bold text-primary hover:bg-secondary/50"
        >
          رسیدهای در انتطار بررسی: {toFaDigits(stats?.pendingReviewCount ?? 0)}
        </Link>
        <Link to="/admin/comments" className="rounded-3xl border border-border bg-card p-4 text-xs font-bold hover:border-primary hover:text-primary transition-colors">
          دیدگاه‌های تأیید‌نشده: {toFaDigits(stats?.pendingCommentCount ?? 0)}
        </Link>
        <Link to="/admin/comments" className="rounded-3xl border border-border bg-card p-4 text-xs font-bold hover:border-primary hover:text-primary transition-colors">
          نقدهای محصول در انتطار: {toFaDigits(stats?.pendingReviewsCount ?? 0)}
        </Link>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-extrabold text-foreground">روند فروش ۱۴ روز گذشته (میلیون تومان)</h2>
        <div className="h-64 w-full" dir="ltr">
          {chartData.length === 0 ? (
            <p className="pt-16 text-center text-xs text-muted-foreground" dir="rtl">
              فعلاً فروش تأیید‌شده‌ای برای نمودار وجود ندارد.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={36} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid var(--color-border)" }}
                  formatter={(value: number) => [String(value), "میلیون تومان"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-brand)" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-foreground">آخرین سفارش‌ها</h2>
          <Link to="/admin/orders" className="text-[11px] font-bold text-primary hover:underline">
            همهٔ سفارش‌ها
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[11px]">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-2 text-start font-bold">کد</th>
                <th className="p-2 text-start font-bold">خریدار</th>
                <th className="p-2 text-start font-bold">شهر</th>
                <th className="p-2 text-start font-bold">مبلغ</th>
                <th className="p-2 text-start font-bold">وضعیت</th>
                <th className="p-2 text-start font-bold">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.code} className="border-b border-border/60 last:border-0">
                  <td className="p-2 font-extrabold">
                    <Link to="/admin/orders" search={{ q: order.code }} className="hover:text-primary">
                      {toFaDigits(order.code)}
                    </Link>
                  </td>
                  <td className="p-2">{order.receiver}</td>
                  <td className="p-2 text-muted-foreground">{order.city}</td>
                  <td className="p-2 font-bold">{formatToman(order.grandTotal)}</td>
                  <td className="p-2">
                    <span className="rounded-full bg-secondary px-2 py-1 font-bold">{order.statusLabel}</span>
                  </td>
                  <td className="p-2 text-muted-foreground">{formatJalali(order.createdAt)}</td>
                </tr>
              ))}
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    هنوز سفارشی ثبت نشده است.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
