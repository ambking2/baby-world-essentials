import { Link } from "@tanstack/react-router";
import { ArrowLeft, Phone } from "lucide-react";

import logoBear from "@/assets/logo-bear.png";
import { toFaDigits } from "@/lib/format";

export function CtaBanner() {
  return (
    <section className="relative my-8 overflow-hidden bg-[oklch(0.72_0.11_235)]">
      <div className="container-page relative flex flex-col items-center gap-4 py-10 text-center md:flex-row md:justify-between md:py-8 md:text-start">
        <div className="flex items-center gap-3">
          <img src={logoBear} alt="" width={64} height={64} className="size-12 md:size-16" />
          <div>
            <p className="text-sm font-black text-white md:text-lg">
              سیسمونی کامل می‌خواهید؟ لیستتان را برایمان بفرستید
            </p>
            <p className="mt-1 text-[11px] text-white/85 md:text-xs">
              کارشناس فروشگاه قیمت کل را حساب می‌کند و پیشنهاد جایگزین ارزان‌تر می‌دهد.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href="tel:+982435223344"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-foreground hover:opacity-90"
          >
            <Phone className="size-4" aria-hidden="true" />
            {toFaDigits("۰۲۴-۳۵۲۲۳۳۴۴")}
          </a>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary py-2.5 ps-5 pe-2.5 text-xs font-bold text-primary-foreground hover:opacity-90"
          >
            ارسال لیست سیسمونی
            <span className="grid size-7 place-items-center rounded-full bg-white/25">
              <ArrowLeft className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>

      <div className="cloud-top" aria-hidden="true" />
      <div className="cloud-bottom" aria-hidden="true" />
    </section>
  );
}
