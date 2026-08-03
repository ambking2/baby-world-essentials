import { Baby, Hammer, Leaf, Ruler, ShieldCheck, Wrench } from "lucide-react";

import workshop from "@/assets/workshop.jpg";
import { SectionHeading } from "@/components/site/SectionHeading";

const left = [
  { icon: Hammer, title: "ساخت در کارگاه ابهر", text: "بدون واسطه، با قیمت درِ کارگاه" },
  { icon: Leaf, title: "رنگ پایه آب و بی‌بو", text: "مناسب اتاق نوزاد" },
  { icon: Ruler, title: "سفارش ابعاد دلخواه", text: "متناسب با اندازه اتاق شما" },
];

const right = [
  { icon: ShieldCheck, title: "۱۸ ماه ضمانت", text: "برای همه کالاهای چوبی" },
  { icon: Wrench, title: "حمل و نصب رایگان", text: "در ابهر، خرمدره و زنجان" },
  { icon: Baby, title: "استاندارد ایمنی کودک", text: "لبه‌های گرد، فاصله میله ۵ سانتی‌متر" },
];

export function SpecialPowers() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={workshop}
        alt="کارگاه چوب فروشگاه جهان کودک در ابهر"
        className="absolute inset-0 size-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-charcoal/75" aria-hidden="true" />

      <div className="container-page relative py-14 md:py-20">
        <SectionHeading eyebrow="چرا از ما می‌خرند" title="نقطه قوت‌های ما" tone="onDark" />

        <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-x-16">
          {[...left, ...right].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13px] font-black text-white">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-white/75">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cloud-top" aria-hidden="true" />
      <div className="zigzag-top" aria-hidden="true" />
      <div className="cloud-bottom" aria-hidden="true" />
      <div className="zigzag-bottom" aria-hidden="true" />
    </section>
  );
}
