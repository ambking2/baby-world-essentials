import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { toFaDigits } from "@/lib/format";
import { deleteMyAddress, getAccount, saveMyAddress } from "@/server/functions/account";

export const Route = createFileRoute("/account/addresses")({
  component: AccountAddresses,
});

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";

function AccountAddresses() {
  const queryClient = useQueryClient();
  const accountQuery = useQuery({ queryKey: ["account"], queryFn: () => getAccount() });

  const [receiver, setReceiver] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("زنجان");
  const [city, setCity] = useState("ابهر");
  const [postalCode, setPostalCode] = useState("");
  const [line, setLine] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["account"] });
  };

  const save = useMutation({
    mutationFn: () =>
      saveMyAddress({
        data: {
          receiver,
          phone,
          province,
          city,
          line,
          isDefault,
          ...(postalCode.trim().length > 0 ? { postalCode: postalCode.trim() } : {}),
        },
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      setReceiver("");
      setPhone("");
      setPostalCode("");
      setLine("");
      setIsDefault(false);
      refresh();
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "ذخیرهٔ نشانی انجام نشد."),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteMyAddress({ data: { id } }),
    onSuccess: (result) => {
      toast.success(result.message);
      refresh();
    },
  });

  const addresses = accountQuery.data?.addresses ?? [];

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h1 className="text-sm font-extrabold">نشانی‌های من</h1>
        {addresses.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
            هنوز نشانی‌ای ذخیره نکرده‌اید.
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between gap-3 rounded-3xl border border-border bg-card p-4">
              <div className="text-xs leading-6">
                <p className="font-extrabold text-foreground">
                  {address.receiver} · {toFaDigits(address.phone)}
                  {address.isDefault ? (
                    <span className="ms-2 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand">پیش‌فرض</span>
                  ) : null}
                </p>
                <p className="text-muted-foreground">
                  {address.province}، {address.city} — {address.line}
                  {address.postalCode ? ` (${toFaDigits(address.postalCode)})` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove.mutate(address.id)}
                className="text-muted-foreground transition-colors hover:text-sale"
                aria-label="حذف نشانی"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="space-y-3 rounded-3xl border border-border bg-card p-5"
      >
        <h2 className="text-sm font-extrabold">افزودن نشانی جدید</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required value={receiver} onChange={(event) => setReceiver(event.target.value)} placeholder="نام تحویل‌گیرنده" className={inputClass} />
          <input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="شمارهٔ تماس" inputMode="tel" className={inputClass} />
          <input required value={province} onChange={(event) => setProvince(event.target.value)} placeholder="استان" className={inputClass} />
          <input required value={city} onChange={(event) => setCity(event.target.value)} placeholder="شهر" className={inputClass} />
          <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} placeholder="کد پستی" inputMode="numeric" className={inputClass} />
        </div>
        <textarea
          required
          value={line}
          onChange={(event) => setLine(event.target.value)}
          rows={3}
          placeholder="نشانی دقیق"
          className={inputClass}
        />
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(event) => setIsDefault(event.target.checked)}
            className="size-4 accent-[var(--color-brand)]"
          />
          این نشانی پیش‌فرض باشد
        </label>
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
        >
          ذخیرهٔ نشانی
        </button>
      </form>
    </div>
  );
}
