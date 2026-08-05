import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { loginUser } from "@/server/functions/auth";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

const inputClass =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-xs outline-none transition-colors focus:border-primary shadow-sm";

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: () => loginUser({ data: { email, password } }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("خوش آمدید!");
        void queryClient.invalidateQueries({ queryKey: storeKeys.session });
        void queryClient.invalidateQueries({ queryKey: storeKeys.cart });
        void navigate({ to: "/account" });
        return;
      }
      toast.message(result.message ?? "ابتدا ایمیل خود را تأیید کنید.");
      void navigate({ to: "/auth/verify", search: { email } });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "ورود انجام نشد.");
    },
  });

  return (
    <StoreShell>
      <div className="container-page flex justify-center py-12">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            login.mutate();
          }}
          className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-white p-8 shadow-sm"
        >
          <div>
            <h1 className="text-lg font-extrabold text-foreground">ورود به حساب کاربری</h1>
            <p className="mt-1 text-xs text-muted-foreground">برای پیگیری سفارش‌ها و لیست علاقه‌مندی‌ها.</p>
          </div>

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
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="رمز عبور"
            className={inputClass}
          />

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition-premium hover:bg-primary/90 disabled:opacity-60"
          >
            {login.isPending ? "در حال ورود…" : "ورود"}
          </button>

          <div className="flex items-center justify-between text-[11px]">
            <Link to="/auth/register" className="font-bold text-primary hover:underline">
              ساخت حساب جدید
            </Link>
            <Link to="/auth/forgot" className="text-muted-foreground hover:text-primary transition-colors">
              رمز عبور را فراموش کرده‌اید؟
            </Link>
          </div>
        </form>
      </div>
    </StoreShell>
  );
}
