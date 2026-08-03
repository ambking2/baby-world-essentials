import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import heroKid from "@/assets/hero-kid.png";
import { toFaDigits } from "@/lib/format";

function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 12" className={`h-3 w-28 ${className}`}>
      <path
        d="M2 8 C10 -2, 18 14, 26 6 S42 -2, 50 8 S66 14, 74 6 S90 -2, 98 8 S114 12, 118 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(120%_120%_at_70%_10%,oklch(0.55_0.09_60),oklch(0.35_0.06_55))] text-primary-foreground">
      <div className="container-page relative grid items-center gap-4 pb-16 pt-8 md:grid-cols-2 md:gap-6 md:pb-28 md:pt-14">
        <div className="text-center md:text-start">
          <h1 className="text-2xl font-black leading-[1.5] md:text-[2.75rem] md:leading-[1.35]">
            سرویس خواب چوبی آرتا
            <span className="block text-primary">فقط {toFaDigits("۲۸٬۵۰۰٬۰۰۰")} تومان</span>
          </h1>

          <Squiggle className="mx-auto mt-4 text-white/70 md:mx-0" />

          <p className="mt-4 max-w-lg text-[13px] leading-7 text-white/85 md:text-sm">
            ساخت کارگاه خودمان در ابهر، چوب راش خشک‌شده با رنگ بی‌خطر کودک. تحویل و نصب رایگان در
            ابهر و زنجان.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              to="/product/$slug"
              params={{ slug: "servis-khab-arta" }}
              className="inline-flex items-center gap-2 rounded-full bg-foreground py-2.5 ps-6 pe-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90"
            >
              مشاهده محصول
              <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                <ArrowLeft className="size-4" aria-hidden="true" />
              </span>
            </Link>
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/50 py-2.5 ps-6 pe-2.5 text-sm font-bold transition-colors hover:bg-white/10"
            >
              تخفیف‌های این هفته
              <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                <ArrowLeft className="size-4" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute inset-0 m-auto size-44 rounded-full bg-white/10 md:size-80" aria-hidden="true" />
          <img
            src={heroKid}
            alt="نوزاد در حال بازی با حلقه‌های چوبی رنگی"
            width={1024}
            height={1024}
            className="relative w-44 max-w-full md:w-[26rem]"
          />
        </div>
      </div>

      {/* slider chrome, matching the store banner layout */}
      <div className="pointer-events-none absolute inset-x-4 top-1/2 hidden -translate-y-1/2 justify-between md:flex">
        <span className="grid size-11 place-items-center rounded-full border-2 border-white/60 bg-primary/90 text-primary-foreground">
          <ChevronRight className="size-5" aria-hidden="true" />
        </span>
        <span className="grid size-11 place-items-center rounded-full border-2 border-white/60 bg-primary/90 text-primary-foreground">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </span>
      </div>

      <div className="cloud-bottom" aria-hidden="true" />
      <div className="zigzag-bottom" aria-hidden="true" />
    </section>
  );
}
