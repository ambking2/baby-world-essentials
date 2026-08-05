import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/store/Breadcrumb";
import { StoreShell } from "@/components/store/StoreShell";
import { business } from "@/data/business";
import { sendContactMessage } from "@/server/functions/catalog";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary/40 focus:bg-white shadow-subtle focus:shadow-premium";

function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const instagramUrl = "https://instagram.com/" + business.instagramHandle;

  const send = useMutation({
    mutationFn: () =>
      sendContactMessage({
        data: {
          name,
          body,
          ...(phone.trim().length > 0 ? { phone: phone.trim() } : {}),
          ...(email.trim().length > 0 ? { email: email.trim() } : {}),
          ...(subject.trim().length > 0 ? { subject: subject.trim() } : {}),
        },
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      setSubject("");
      setBody("");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "ارسال پیام انجام نشد."),
  });

  return (
    <StoreShell>
      <div className="container-page py-6">
        <Breadcrumb items={[{ title: "تماس با ما" }]} />

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send.mutate();
            }}
            className="space-y-6 rounded-3xl border border-border bg-white p-8 md:p-10 shadow-soft"
          >
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">پیام به جهان کودک</h1>
            <p className="text-xs leading-6 text-muted-foreground">
              برای مشاورهٔ خرید، پیگیری سفارش یا سفارش ساخت سرویس خواب فرم زیر را پر کنید.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="نام و نام خانوادگی" className={inputClass} />
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="شمارهٔ تماس" inputMode="tel" className={inputClass} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ایمیل (اختیاری)"
                dir="ltr"
                className={inputClass}
              />
              <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="موضوع" className={inputClass} />
            </div>

            <textarea
              required
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={5}
              placeholder="متن پیام…"
              className={inputClass}
            />

            <button
              type="submit"
              disabled={send.isPending}
              className="btn-primary w-full sm:w-auto"
            >
              {send.isPending ? "در حال ارسال…" : "ارسال پیام"}
            </button>
          </form>

          <aside className="h-fit space-y-6 rounded-3xl border border-border bg-white p-8 text-sm leading-relaxed shadow-soft">
            <h2 className="text-sm font-extrabold text-foreground">راه‌های ارتباط</h2>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 text-primary" aria-hidden />
              <a href={business.phoneHref} className="hover:text-primary font-bold">
                {business.phoneDisplay}
              </a>
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4 text-primary" aria-hidden />
              <a href={`mailto:${business.supportEmail}`} className="hover:text-primary" dir="ltr">
                {business.supportEmail}
              </a>
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Instagram className="size-4 text-primary" aria-hidden />
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="hover:text-primary" dir="ltr">
                @{business.instagramHandle}
              </a>
            </p>
            <p className="flex items-start gap-2 text-muted-foreground border-t border-border pt-6">
              <MapPin className="mt-1 size-4 text-primary" aria-hidden />
              <span className="leading-relaxed">{business.addressLine}</span>
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4 text-primary" aria-hidden />
              <span>{business.hoursFull}</span>
            </p>
          </aside>
        </div>
      </div>
    </StoreShell>
  );
}
