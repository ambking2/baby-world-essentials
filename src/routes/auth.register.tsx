import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { StoreShell } from "@/components/store/StoreShell";
import { registerUser } from "@/server/functions/auth";

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
});

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const register = useMutation({
    mutationFn: () =>
      registerUser({
        data: {
          name,
          email,
          password,
          ...(phone.trim().length > 0 ? { phone: phone.trim() } : {}),
        },
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      void navigate({ to: "/auth/verify", search: { email: result.email } });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "ثبت‌نام انجام نشد.");
    },
  });

  return (
    <StoreShell>
      <div className="container-page flex justify-center py-12">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            register.mutate();
          }}
          className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-6"
        >
          <div>
            <h1 className="text-lg font-extrabold text-foreground">ساخت حساب کاربری</h1>
            <p className="mt-1 text-xs text-muted-foreground">پس از ثبت‌نام، کد ۶ رقمی به ایمیل شما ارسال می‌شود.</p>
          </div>

          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="نام و نام خانوادگی" className={inputClass} />
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ایمیل"
            className={inputClass}
            dir="ltr"
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="شمارهٔ موبایل (اختیاری)"
            inputMode="tel"
            className={inputClass}
          />
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="رمز عبور (حداقل ۸ کاراکتر)"
            className={inputClass}
          />

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {register.isPending ? "در حال ثبت‌نام…" : "ثبت‌نام"}
          </button>

          <p className="text-[11px] text-muted-foreground">
            قبلاً حساب ساخته‌اید؟{" "}
            <Link to="/auth/login" className="font-bold text-brand hover:underline">
              ورود به حساب
            </Link>
          </p>
        </form>
      </div>
    </StoreShell>
  );
}
