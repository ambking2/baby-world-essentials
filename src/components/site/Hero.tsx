import { Link } from "@tanstack/react-router";

import heroKid from "@/assets/hero-kid.png";
import { Button } from "@/components/ui/button";
import { toFaDigits } from "@/lib/format";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="container-page relative grid items-center gap-6 pb-20 pt-8 md:grid-cols-2 md:pb-24 md:pt-12">
        <div>
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs">
            ارسال رایگان در ابهر و زنجان
          </span>
          <h1 className="mt-4 text-2xl font-black leading-relaxed md:text-4xl md:leading-[1.4]">
            سیسمونی نوزاد را یک‌جا از جهان کودک بخرید
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/85 md:text-base">
            سرویس خواب چوبی ساخت کارگاه خودمان در ابهر، کالسکه، پوشاک نخی، اسباب‌بازی و لوازم تغذیه.
            ارسال به سراسر ایران و تحویل رایگان در ابهر و زنجان.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-full px-7">
              <Link to="/shop">شروع خرید</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-transparent px-7 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link to="/offers">تخفیف‌های این هفته</Link>
            </Button>
          </div>
          <dl className="mt-8 flex gap-8 text-sm">
            <div>
              <dt className="text-white/70">سال فعالیت</dt>
              <dd className="text-xl font-black">{toFaDigits(13)}</dd>
            </div>
            <div>
              <dt className="text-white/70">سفارش تحویل‌شده</dt>
              <dd className="text-xl font-black">+{toFaDigits("۹٬۴۰۰")}</dd>
            </div>
            <div>
              <dt className="text-white/70">ضمانت کالا</dt>
              <dd className="text-xl font-black">{toFaDigits(18)} ماه</dd>
            </div>
          </dl>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute inset-0 m-auto size-64 rounded-full bg-white/10 md:size-80" aria-hidden="true" />
          <img
            src={heroKid}
            alt="نوزاد در حال بازی با حلقه‌های رنگی"
            width={1024}
            height={1024}
            className="relative w-64 max-w-full md:w-[26rem]"
          />
        </div>
      </div>
      <div className="cloud-bottom" aria-hidden="true" />
    </section>
  );
}
