import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Package, Wallet } from "lucide-react";
import { toast } from "sonner";

import { formatToman, toFaDigits } from "@/lib/format";
import { changeMyPassword, getAccount, updateMyProfile } from "@/server/functions/account";

export const Route = createFileRoute("/account/")({
  component: AccountHome,
});

const inputClass =
  "w-full rounded-full border-[1.5px] border-outline-variant bg-surface-container-lowest px-5 py-3 text-sm outline-none transition-all placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/15";

function AccountHome() {
  const accountQuery = useQuery({ queryKey: ["account"], queryFn: () => getAccount() });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const user = accountQuery.data?.user;
    if (user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [accountQuery.data?.user]);

  const saveProfile = useMutation({
    mutationFn: () => updateMyProfile({ data: { name, phone } }),
    onSuccess: (result) => toast.success(result.message),
    onError: (error) => toast.error(error instanceof Error ? error.message : "ذخیره انجام نشد."),
  });

  const changePassword = useMutation({
    mutationFn: () => changeMyPassword({ data: { currentPassword, newPassword } }),
    onSuccess: (result) => {
      toast.success(result.message);
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "تغییر رمز انجام نشد."),
  });

  const orders = accountQuery.data?.orders ?? [];
  const paidTotal = orders
    .filter((order) => ["paid", "processing", "shipped", "delivered"].includes(order.status))
    .reduce((sum, order) => sum + order.grandTotal, 0);

  const stats = [
    { icon: Package, label: "تعداد سفارش‌ها", value: toFaDigits(orders.length), tone: "bg-primary-fixed text-primary" },
    { icon: Wallet, label: "جمع خریدهای تأییدشده", value: formatToman(paidTotal), tone: "bg-secondary-fixed text-secondary" },
    { icon: Heart, label: "علاقه‌مندی‌ها", value: toFaDigits(accountQuery.data?.wishlist.length ?? 0), tone: "bg-tertiary-fixed text-tertiary" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card-soft flex items-center gap-3 rounded-lg p-card-padding">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${stat.tone}`}>
              <stat.icon className="size-5" />
            </span>
            <div>
              <p className="text-[11px] text-on-surface-variant">{stat.label}</p>
              <p className="font-price-display text-price-display mt-0.5 text-on-surface">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Profile form */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          saveProfile.mutate();
        }}
        className="card-soft rounded-lg p-card-padding"
      >
        <h2 className="font-headline-sm text-headline-sm mb-5 font-bold text-on-surface">اطلاعات حساب</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="نام و نام خانوادگی" className={inputClass} />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="شمارهٔ موبایل" inputMode="tel" className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={saveProfile.isPending}
          className="mt-5 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          ذخیرهٔ تغییرات
        </button>
      </form>

      {/* Password form */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          changePassword.mutate();
        }}
        className="card-soft rounded-lg p-card-padding"
      >
        <h2 className="font-headline-sm text-headline-sm mb-5 font-bold text-on-surface">تغییر رمز عبور</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="رمز فعلی"
            className={inputClass}
          />
          <input
            required
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="رمز جدید"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={changePassword.isPending}
          className="mt-5 rounded-full border-2 border-primary px-8 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-fixed active:scale-95 disabled:opacity-60"
        >
          تغییر رمز
        </button>
      </form>
    </div>
  );
}
