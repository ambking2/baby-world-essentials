import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { formatToman, toFaDigits } from "@/lib/format";
import { changeMyPassword, getAccount, updateMyProfile } from "@/server/functions/account";

export const Route = createFileRoute("/account/")({
  component: AccountHome,
});

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";

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

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">تعداد سفارش‌ها</p>
          <p className="mt-1 text-lg font-extrabold text-foreground">{toFaDigits(orders.length)}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">جمع خریدهای تأیید‌شده</p>
          <p className="mt-1 text-lg font-extrabold text-brand">{formatToman(paidTotal)}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-4">
          <p className="text-[11px] text-muted-foreground">علاقه‌مندی‌ها</p>
          <p className="mt-1 text-lg font-extrabold text-foreground">{toFaDigits(accountQuery.data?.wishlist.length ?? 0)}</p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          saveProfile.mutate();
        }}
        className="space-y-3 rounded-3xl border border-border bg-card p-5"
      >
        <h2 className="text-sm font-extrabold">اطلاعات حساب</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="نام و نام خانوادگی" className={inputClass} />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="شمارهٔ موبایل" inputMode="tel" className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={saveProfile.isPending}
          className="rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
        >
          ذخیرهٔ تغییرات
        </button>
      </form>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          changePassword.mutate();
        }}
        className="space-y-3 rounded-3xl border border-border bg-card p-5"
      >
        <h2 className="text-sm font-extrabold">تغییر رمز عبور</h2>
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
          className="rounded-full border border-border px-5 py-2.5 text-xs font-bold transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
        >
          تغییر رمز
        </button>
      </form>
    </div>
  );
}
