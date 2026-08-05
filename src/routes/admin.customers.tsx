import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MailCheck, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { formatJalali, formatJalaliTime, formatToman, toFaDigits } from "@/lib/format";
import { 
  getAdminCustomers, 
  markAdminMessageRead, 
  updateUserRoleMutation 
} from "@/server/functions/admin";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [appliedTerm, setAppliedTerm] = useState("");

  const dataQuery = useQuery({
    queryKey: ["admin-customers", appliedTerm],
    queryFn: () => getAdminCustomers({ data: appliedTerm.trim().length > 0 ? { q: appliedTerm.trim() } : {} }),
  });

  const markRead = useMutation({
    mutationFn: (input: { id: number; isRead: boolean }) => markAdminMessageRead({ data: input }),
    onSuccess: () => {
      toast.success("وضعیت پیام به‌روز شد.");
      void queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    },
  });

  const changeRole = useMutation({
    mutationFn: (input: { userId: number; role: "customer" | "admin" | "sales" }) => updateUserRole({ data: input }),
    onSuccess: (result: { message: string }) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    },
    onError: () => {
      toast.error("خطا در تغییر نقش.");
    },
  });

  const customers = dataQuery.data?.customers ?? [];
  const messages = dataQuery.data?.messages ?? [];
  const newsletter = dataQuery.data?.newsletter ?? [];

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-sm font-extrabold text-foreground">مشتریان ({toFaDigits(customers.length)})</h1>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedTerm(term);
            }}
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
          >
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="جستجو با نام، ایمیل یا موبایل…"
              className="w-56 bg-transparent text-xs outline-none"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[11px]">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-2 text-start font-bold">نام</th>
                <th className="p-2 text-start font-bold">ایمیل</th>
                <th className="p-2 text-start font-bold">موبایل</th>
                <th className="p-2 text-start font-bold">تأیید ایمیل</th>
                <th className="p-2 text-start font-bold">نقش</th>
                <th className="p-2 text-start font-bold">سفارش‌ها</th>
                <th className="p-2 text-start font-bold">مجموع خرید</th>
                <th className="p-2 text-start font-bold">عضویت</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-border/60 last:border-0">
                  <td className="p-2 font-extrabold">{customer.name}</td>
                  <td className="p-2 text-muted-foreground" dir="ltr">
                    {customer.email}
                  </td>
                  <td className="p-2 text-muted-foreground">{customer.phone ? toFaDigits(customer.phone) : "—"}</td>
                  <td className="p-2">{customer.emailVerified ? "تأییدشده" : "در انتطار"}</td>
                  <td className="p-2">
                    <select
                      value={customer.role}
                      disabled={changeRole.isPending}
                      onChange={(e) => {
                        const newRole = e.target.value as "customer" | "admin" | "sales";
                        changeRole.mutate({ userId: customer.id, role: newRole });
                      }}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-[10px] outline-none focus:border-brand disabled:opacity-50"
                    >
                      <option value="customer">مشتری</option>
                      <option value="sales">کارشناس فروش</option>
                      <option value="admin">مدیر کل</option>
                    </select>
                  </td>
                  <td className="p-2">{toFaDigits(customer.orderCount)}</td>
                  <td className="p-2 font-bold">{formatToman(customer.totalSpent)}</td>
                  <td className="p-2 text-muted-foreground">{formatJalali(customer.createdAt)}</td>
                </tr>
              ))}
              {customers.length === 0 && !dataQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    مشتری‌ای پیدا نشد.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-sm font-extrabold text-foreground">پیام‌های فرم تماس ({toFaDigits(messages.length)})</h2>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`space-y-2 rounded-2xl border p-3 ${message.isRead ? "border-border" : "border-brand/50 bg-brand-soft/30"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-extrabold text-foreground">
                  {message.name}
                  {message.phone ? <span className="ms-2 font-normal text-muted-foreground">{toFaDigits(message.phone)}</span> : null}
                  {message.email ? (
                    <span className="ms-2 text-[10px] font-normal text-muted-foreground" dir="ltr">
                      {message.email}
                    </span>
                  ) : null}
                </p>
                <p className="text-[10px] text-muted-foreground">{formatJalaliTime(message.createdAt)}</p>
              </div>
              {message.subject ? <p className="text-[11px] font-bold text-brand">{message.subject}</p> : null}
              <p className="whitespace-pre-line text-[11px] leading-6 text-muted-foreground">{message.body}</p>
              <button
                type="button"
                onClick={() => markRead.mutate({ id: message.id, isRead: !message.isRead })}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-bold hover:border-brand hover:text-brand"
              >
                <MailCheck className="size-3" aria-hidden />
                {message.isRead ? "علامت‌زدن به عنوان خوانده‌نشده" : "خواندم"}
              </button>
            </div>
          ))}
          {messages.length === 0 && !dataQuery.isLoading ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-[11px] text-muted-foreground">
              پیامی دریافت نشده است.
            </p>
          ) : null}
        </section>

        <section className="h-fit space-y-2 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-sm font-extrabold text-foreground">خبرنامه ({toFaDigits(newsletter.length)})</h2>
          <div className="space-y-1">
            {newsletter.map((item) => (
              <p key={item.email} className="rounded-xl bg-secondary px-3 py-2 text-[10px] text-muted-foreground" dir="ltr">
                {item.email}
              </p>
            ))}
            {newsletter.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">هنوز کسی عضو خبرنامه نشده است.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
