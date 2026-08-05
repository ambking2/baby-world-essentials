import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getAdminSettings, saveAdminSettings } from "@/@/lib/admin.functions";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const field =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";
const label = "mb-1 block text-[11px] font-bold text-foreground";

const KEYS = [
  { key: "announcement", title: "متن نوار اعلان بالای سایت", ltr: false },
  { key: "free_shipping_threshold", title: "سقف ارسال رایگان (تومان)", ltr: true },
  { key: "shipping_flat_fee", title: "کرایهٔ ثابت ارسال (تومان)", ltr: true },
  { key: "card_number", title: "شمارهٔ کارت برای کارت‌به‌کارت", ltr: true },
  { key: "card_holder", title: "نام صاحب کارت", ltr: false },
  { key: "card_bank", title: "نام بانک", ltr: false },
] as const;

function AdminSettings() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: ["admin-settings"], queryFn: () => getAdminSettings() });
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const loaded = settingsQuery.data?.settings;
    if (loaded) setValues({ ...loaded });
  }, [settingsQuery.data]);

  const save = useMutation({
    mutationFn: () => saveAdminSettings({ data: { values } }),
    onSuccess: (result) => {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["catalog-shell"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "ذخیرهٔ تنطیمات انجام نشد."),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate();
      }}
      className="max-w-2xl space-y-4"
    >
      <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <h1 className="text-sm font-extrabold text-foreground">تنطیمات فروشگاه</h1>
        <p className="text-[11px] leading-6 text-muted-foreground">
          مقادیر زیر در صفحهٔ پرداخت، نوار اعلان و محاسبهٔ کرایه استفاده می‌شوند.
        </p>

        {KEYS.map((item) => (
          <div key={item.key}>
            <span className={label}>{item.title}</span>
            {item.key === "announcement" ? (
              <textarea
                value={values[item.key] ?? ""}
                onChange={(event) => setValues({ ...values, [item.key]: event.target.value })}
                rows={2}
                className={field}
              />
            ) : (
              <input
                value={values[item.key] ?? ""}
                onChange={(event) => setValues({ ...values, [item.key]: event.target.value })}
                {...(item.ltr ? { dir: "ltr" as const } : {})}
                className={field}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-full bg-primary px-8 py-2.5 text-[11px] font-bold text-white shadow-sm hover:bg-primary/95 disabled:opacity-60 transition-colors"
        >
          {save.isPending ? "در حال ذخیره…" : "ذخیرهٔ تنطیمات"}
        </button>
      </section>
    </form>
  );
}
