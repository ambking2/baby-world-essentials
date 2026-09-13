import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, PlusCircle, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteMyAddress, getAccount, saveMyAddress } from "@/server/functions/account";

export const Route = createFileRoute("/account/addresses")({
  component: AccountAddresses,
});

const inputClass =
  "w-full rounded-full border-[1.5px] border-outline-variant bg-surface-container-lowest px-5 py-3 text-sm outline-none transition-all placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/15";

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
    <div className="space-y-6">
      <h1 className="font-headline-md text-headline-md font-bold text-on-surface">نشانی‌های من</h1>

      {addresses.length === 0 ? (
        <div className="card-soft rounded-lg p-12 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
            <MapPin className="size-6" />
          </div>
          <p className="text-sm text-on-surface-variant">هنوز نشانی‌ای ذخیره نکرده‌اید. برای خرید سریع‌تر، نشانی خود را ثبت کنید.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={cn(
                "card-soft flex items-start justify-between gap-3 rounded-lg p-5",
                address.isDefault && "border-2 border-primary bg-primary-fixed/10",
              )}
            >
              <div className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
                  <MapPin className="size-5" />
                </span>
                <div className="text-[13px] leading-6">
                  <p className="flex flex-wrap items-center gap-2 font-bold text-on-surface">
                    {address.receiver}
                    <span className="flex items-center gap-1 text-[12px] font-semibold text-on-surface-variant">
                      <Phone className="size-3" />
                      {toFaDigits(address.phone)}
                    </span>
                    {address.isDefault ? (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-on-primary">پیش‌فرض تحویل</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-on-surface-variant">
                    {address.province}، {address.city} — {address.line}
                    {address.postalCode ? ` (کد پستی ${toFaDigits(address.postalCode)})` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove.mutate(address.id)}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
                aria-label="حذف نشانی"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="card-soft rounded-lg p-6"
      >
        <h2 className="font-headline-sm text-headline-sm mb-5 flex items-center gap-2 font-bold text-on-surface">
          <PlusCircle className="size-5 text-primary" />
          افزودن نشانی جدید
        </h2>
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
          className={cn(inputClass, "mt-3 rounded-2xl")}
        />
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-[13px] text-on-surface">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(event) => setIsDefault(event.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          این نشانی پیش‌فرض باشد
        </label>
        <button
          type="submit"
          disabled={save.isPending}
          className="mt-5 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-container px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          <UserRound className="size-4" />
          ذخیرهٔ نشانی
        </button>
      </form>
    </div>
  );
}
