import { Hammer, ShieldCheck, Store, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-nursery.jpg";

const points = [
  { icon: Store, text: "فروشگاه حضوری در ابهر" },
  { icon: Hammer, text: "تولیدکننده سرویس چوبی" },
  { icon: CreditCard, text: "پرداخت ۶ قسطه بدون بهره" },
  { icon: ShieldCheck, text: "۱۸ ماه گارانتی سازه چوب" },
];

export function Hero() {
  return (
    <section className="bg-sand">
      <div className="container-page grid items-center gap-10 py-10 md:grid-cols-2 md:py-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-primary">
            <Hammer className="size-3.5" aria-hidden="true" />
            ساخت سرویس خواب چوبی در کارگاه خودمان
          </p>
          <h1 className="mt-5 text-3xl leading-[1.35] font-bold text-foreground md:text-5xl md:leading-[1.3]">
            سیسمونی کامل نوزاد،
            <br />
            از تخت چوبی تا لباس و کالسکه
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-8 text-muted-foreground md:text-base">
            در فروشگاه جهان کودک ابهر می‌توانید همه اقلام سیسمونی را یکجا تهیه کنید. سرویس خواب چوبی
            را خودمان می‌سازیم، پس اندازه، رنگ و طرح را مطابق اتاق شما تحویل می‌دهیم. خرید نقدی یا
            با اقساط ۶ ماهه.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-xl" asChild>
              <a href="#categories">مشاهده محصولات</a>
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl" asChild>
              <a href="#installment">شرایط خرید قسطی</a>
            </Button>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-foreground">
            {points.map((p) => (
              <li key={p.text} className="flex items-center gap-2">
                <p.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <img
            src={heroImage}
            alt="اتاق نوزاد با تخت چوبی و دراور ساخت جهان کودک"
            width={1600}
            height={1200}
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
          />
          <div className="glass-panel absolute bottom-4 start-4 rounded-2xl px-4 py-3 shadow-[var(--shadow-soft)]">
            <p className="text-xs text-muted-foreground">سرویس خواب آرتا</p>
            <p className="mt-1 text-sm font-bold">۲۸٬۵۰۰٬۰۰۰ تومان</p>
            <p className="mt-1 text-xs text-installment-foreground">
              یا ۶ قسط ماهانه ۴٬۷۵۰٬۰۰۰ تومان
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
