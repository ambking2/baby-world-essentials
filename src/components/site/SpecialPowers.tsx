import { Baby, Hammer, Leaf, Ruler, ShieldCheck, Wrench, Sparkles } from "lucide-react";

import workshop from "@/assets/workshop.jpg";
import { SectionHeading } from "@/components/store/SectionHeading";

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
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="cloud-top z-10" />
      <div className="zigzag-top z-10" />

      <img
        src={workshop}
        alt="کارگاه چوب فروشگاه جهان کودک در ابهر"
        className="absolute inset-0 size-full object-cover grayscale-[0.2]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/90 via-charcoal/80 to-charcoal/95" aria-hidden="true" />

      <div className="container-page relative z-20">
        <SectionHeading 
          eyebrow="تعهد ما به کیفیت" 
          title="چرا والدین جهان کودک را انتخاب می‌کنند؟" 
          subtitle="ما فقط فروشنده نیستیم؛ ما با عشق و دقت، امن‌ترین فضا را برای فرشته‌های کوچک شما می‌سازیم."
          tone="onDark" 
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[...left, ...right].map((item) => (
            <div key={item.title} className="group flex items-start gap-4 rounded-[2.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-500 hover:bg-white/10 hover:-translate-y-2">
              <span className="grid size-14 shrink-0 place-items-center rounded-[1.4rem] bg-gradient-to-br from-brand to-sale text-white shadow-lift ring-4 ring-white/5 transition-transform group-hover:scale-110">
                <item.icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-base font-black text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-6 text-white/60">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 text-xs font-bold text-white shadow-inner backdrop-blur-md ring-1 ring-white/20">
            <Sparkles className="size-4 text-brand" />
            تضمین ۱۰۰٪ رضایت والدین در ابهر و سراسر ایران
          </div>
        </div>
      </div>

      <div className="cloud-bottom z-10" />
      <div className="zigzag-bottom z-10" />
    </section>
  );
}
