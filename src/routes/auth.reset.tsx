import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { StoreShell } from "@/components/store/StoreShell";
import { resetPassword } from "@/server/functions/auth";

type ResetSearch = { email: string };

export const Route = createFileRoute("/auth/reset")({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    email: typeof search["email"] === "string" ? (search["email"] as string) : "",
  }),
  component: ResetPage,
});

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";

function ResetPage() {
  const { email: initialEmail } = Route.useSearch();
  const navigate = useNavigate();

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const reset = useMutation({
    mutationFn: () => resetPassword({ data: { email, code, password } }),
    onSuccess: (result) => {
      toast.success(result.message);
      void navigate({ to: "/auth/login" });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "تغییر رمز انجام نشد."),
  });

  return (
    <StoreShell>
      <div className="container-page flex justify-center py-12">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            reset.mutate();
          }}
          className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-6"
        >
          <div>
            <h1 className="text-lg font-extrabold text-foreground">تعیین رمز عبور جدید</h1>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">کد ارسال‌شده به ایمیل و رمز تازه را وارد کنید.</p>
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
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="کد بازیابی"
            inputMode="numeric"
            className={`${inputClass} text-center tracking-[0.5em]`}
            dir="ltr"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="رمز عبور جدید"
            className={inputClass}
          />

          <button
            type="submit"
            disabled={reset.isPending}
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {reset.isPending ? "در حال ثبت…" : "ثبت رمز جدید"}
          </button>
        </form>
      </div>
    </StoreShell>
  );
}
