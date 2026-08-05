import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { formatJalali, formatToman, toFaDigits } from "@/lib/format";
import { getAdminCoupons, removeAdminCoupon, saveAdminCoupon } from "@/@/lib/admin.functions";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCoupons,
});

const field =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";
const label = "mb-1 block text-[11px] font-bold text-foreground";

type FormState = {
  id: number | null;
  code: string;
  kind: "percent" | "amount";
  value: number;
  minTotal: number;
  maxOff: number | "";
  maxUses: number | "";
  endsAt: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  id: null,
  code: "",
  kind: "percent",
  value: 10,
  minTotal: 0,
  maxOff: "",
  maxUses: "",
  endsAt: "",
  isActive: true,
};

function AdminCoupons() {
  const queryClient = useQueryClient();
  const couponsQuery = useQuery({ queryKey: ["admin-coupons"], queryFn: () => getAdminCoupons() });
  const [form, setForm] = useState<FormState>(emptyForm);

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });

  const save = useMutation({
    mutationFn: () =>
      saveAdminCoupon({
        data: {
          ...(form.id === null ? {} : { id: form.id }),
          code: form.code.trim(),
          kind: form.kind,
          value: Math.max(0, Math.round(form.value)),
          minTotal: Math.max(0, Math.round(form.minTotal)),
          maxOff: form.maxOff === "" ? null : Math.max(0, Math.round(form.maxOff)),
          maxUses: form.maxUses === "" ? null : Math.max(0, Math.round(form.maxUses)),
          endsAt: form.endsAt.length > 0 ? new Date(`${form.endsAt}T23:59:00`).toISOString() : null,
          isActive: form.isActive,
        },
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      setForm(emptyForm);
      refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "ذخیرهٔ کد تخفیف انجام نشد."),
  });

  const remove = useMutation({
    mutationFn: (id: number) => removeAdminCoupon({ data: { id } }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
  });

  const coupons = couponsQuery.data?.coupons ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section className="overflow-x-auto rounded-3xl border border-border bg-card p-5">
        <h1 className="mb-3 text-sm font-extrabold text-foreground">کدهای تخفیف</h1>
        <table className="w-full min-w-[680px] text-[11px]">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-2 text-start font-bold">کد</th>
              <th className="p-2 text-start font-bold">مقدار</th>
              <th className="p-2 text-start font-bold">حداقل خرید</th>
              <th className="p-2 text-start font-bold">سقف تخفیف</th>
              <th className="p-2 text-start font-bold">مصرف</th>
              <th className="p-2 text-start font-bold">انقضا</th>
              <th className="p-2 text-start font-bold">فعال</th>
              <th className="p-2 text-start font-bold" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-border/60 last:border-0">
                <td className="p-2 font-extrabold" dir="ltr">
                  {coupon.code}
                </td>
                <td className="p-2">
                  {coupon.kind === "amount" ? formatToman(coupon.value) : `${toFaDigits(coupon.value)}٪`}
                </td>
                <td className="p-2 text-muted-foreground">{formatToman(coupon.minTotal)}</td>
                <td className="p-2 text-muted-foreground">{coupon.maxOff === null ? "—" : formatToman(coupon.maxOff)}</td>
                <td className="p-2">
                  {toFaDigits(coupon.usedCount)}
                  {coupon.maxUses === null ? "" : ` / ${toFaDigits(coupon.maxUses)}`}
                </td>
                <td className="p-2 text-muted-foreground">{coupon.endsAt ? formatJalali(coupon.endsAt) : "بدون محدودیت"}</td>
                <td className="p-2">{coupon.isActive ? "فعال" : "غیرفعال"}</td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          id: coupon.id,
                          code: coupon.code,
                          kind: coupon.kind === "amount" ? "amount" : "percent",
                          value: coupon.value,
                          minTotal: coupon.minTotal,
                          maxOff: coupon.maxOff ?? "",
                          maxUses: coupon.maxUses ?? "",
                          endsAt: coupon.endsAt ? coupon.endsAt.slice(0, 10) : "",
                          isActive: coupon.isActive,
                        })
                      }
                      className="rounded-lg border border-border px-2 py-1 text-[10px] font-bold hover:border-brand hover:text-brand"
                    >
                      ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`کد «${coupon.code}» حذف شود؟`)) remove.mutate(coupon.id);
                      }}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-sale hover:text-sale"
                      aria-label="حذف کد"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && !couponsQuery.isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  هنوز کد تخفیفی ساخته نشده است.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="h-fit space-y-3 rounded-3xl border border-border bg-card p-5"
      >
        <h2 className="text-sm font-extrabold text-foreground">{form.id === null ? "کد تخفیف جدید" : "ویرایش کد"}</h2>

        <div>
          <span className={label}>کد</span>
          <input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} dir="ltr" className={field} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={label}>نوع</span>
            <select
              value={form.kind}
              onChange={(event) => setForm({ ...form, kind: event.target.value === "amount" ? "amount" : "percent" })}
              className={field}
            >
              <option value="percent">درصدی</option>
              <option value="amount">مبلغ ثابت</option>
            </select>
          </div>
          <div>
            <span className={label}>{form.kind === "percent" ? "درصد" : "مبلغ (تومان)"}</span>
            <input
              type="number"
              value={form.value}
              onChange={(event) => setForm({ ...form, value: Number(event.target.value) })}
              className={field}
            />
          </div>
        </div>
        <div>
          <span className={label}>حداقل مبلغ سبد (تومان)</span>
          <input
            type="number"
            value={form.minTotal}
            onChange={(event) => setForm({ ...form, minTotal: Number(event.target.value) })}
            className={field}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={label}>سقف تخفیف</span>
            <input
              type="number"
              value={form.maxOff === "" ? "" : form.maxOff}
              onChange={(event) => setForm({ ...form, maxOff: event.target.value === "" ? "" : Number(event.target.value) })}
              className={field}
            />
          </div>
          <div>
            <span className={label}>سقف تعداد مصرف</span>
            <input
              type="number"
              value={form.maxUses === "" ? "" : form.maxUses}
              onChange={(event) => setForm({ ...form, maxUses: event.target.value === "" ? "" : Number(event.target.value) })}
              className={field}
            />
          </div>
        </div>
        <div>
          <span className={label}>تاریخ انقضا</span>
          <input type="date" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} className={field} />
        </div>

        <label className="flex items-center gap-2 text-[11px]">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            className="size-4 accent-[var(--color-brand)]"
          />
          کد فعال باشد
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={save.isPending}
            className="flex-1 rounded-full bg-brand px-4 py-2.5 text-[11px] font-bold text-primary-foreground disabled:opacity-60"
          >
            ذخیره
          </button>
          {form.id === null ? null : (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="rounded-full border border-border px-4 py-2.5 text-[11px] font-bold hover:border-brand hover:text-brand"
            >
              لغو
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
