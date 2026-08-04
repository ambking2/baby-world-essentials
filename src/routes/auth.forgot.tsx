import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { StoreShell } from "@/components/store/StoreShell";
import { requestPasswordReset } from "@/server/functions/auth";

export const Route = createFileRoute("/auth/forgot")({
  component: ForgotPage,
});

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";

function ForgotPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const request = useMutation({
    mutationFn: () => requestPasswordReset({ data: { email } }),
    onSuccess: (result) => {
      toast.success(result.message);
      void navigate({ to: "/auth/reset", search: { email } });
    },
    onError: () => toast.error("ارسال کد بازیابی انجام نشد."),
  });

  return (
    <StoreShell>
      <div className="container-page flex justify-center py-12">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            request.mutate();
          }}
          className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-6"
        >
          <div>
            <h1 className="text-lg font-extrabold text-foreground">بازیابی رمز عبور</h1>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">ایمیل حسابتان را وارد کنید تا کد بازیابی ارسال شود.</p>
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

          <button
            type="submit"
            disabled={request.isPending}
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {request.isPending ? "در حال ارسال…" : "ارسال کد بازیابی"}
          </button>

          <p className="text-[11px] text-muted-foreground">
            کد را دارید؟{" "}
            <Link to="/auth/reset" search={{ email: "" }} className="font-bold text-brand hover:underline">
              تعیین رمز جدید
            </Link>
          </p>
        </form>
      </div>
    </StoreShell>
  );
}
