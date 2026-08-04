import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { StoreShell, storeKeys } from "@/components/store/StoreShell";
import { resendVerificationCode, verifyEmailCode } from "@/server/functions/auth";

type VerifySearch = { email: string };

export const Route = createFileRoute("/auth/verify")({
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    email: typeof search["email"] === "string" ? (search["email"] as string) : "",
  }),
  component: VerifyPage,
});

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none transition-colors focus:border-brand";

function VerifyPage() {
  const { email: initialEmail } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");

  const verify = useMutation({
    mutationFn: () => verifyEmailCode({ data: { email, code } }),
    onSuccess: () => {
      toast.success("ایمیل شما تأیید شد.");
      void queryClient.invalidateQueries({ queryKey: storeKeys.session });
      void queryClient.invalidateQueries({ queryKey: storeKeys.cart });
      void navigate({ to: "/account" });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "تأیید انجام نشد."),
  });

  const resend = useMutation({
    mutationFn: () => resendVerificationCode({ data: { email } }),
    onSuccess: (result) => toast.success(result.message),
    onError: () => toast.error("ارسال دوبارهٔ کد انجام نشد."),
  });

  return (
    <StoreShell>
      <div className="container-page flex justify-center py-12">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            verify.mutate();
          }}
          className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-6"
        >
          <div>
            <h1 className="text-lg font-extrabold text-foreground">تأیید ایمیل</h1>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              کد ۶ رقمی ارسال‌شده به ایمیل را وارد کنید. کد تا ۱۰ دقیقه اعتبار دارد.
            </p>
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
            placeholder="کد تأیید"
            inputMode="numeric"
            className={`${inputClass} text-center tracking-[0.5em]`}
            dir="ltr"
          />

          <button
            type="submit"
            disabled={verify.isPending}
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {verify.isPending ? "در حال بررسی…" : "تأیید و ورود"}
          </button>

          <button
            type="button"
            onClick={() => resend.mutate()}
            disabled={resend.isPending || email.trim().length === 0}
            className="w-full text-[11px] text-muted-foreground hover:text-brand disabled:opacity-50"
          >
            ارسال دوبارهٔ کد تأیید
          </button>
        </form>
      </div>
    </StoreShell>
  );
}
