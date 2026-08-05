import { Link } from "@tanstack/react-router";
import { Sparkles, Store, ShieldCheck, Hammer } from "lucide-react";

import { SectionHeading } from "@/components/store/SectionHeading";
import { toFaDigits } from "@/lib/format";

const columns = [
  {
    icon: Hammer,
    title: "کارگاه چوب اختصاصی",
    text: "سرویس خواب، دراور و تخت را در کارگاه خودمان با چوب راش و متریال درجه‌یک می‌سازیم؛ با امکان شخصی‌سازی کامل.",
    tone: "bg-brand-soft text-brand",
  },
  {
    icon: Store,
    title: "فروشگاه حضوری واقعی",
    text: "ما فقط یک سایت نیستیم. در قلب ابهر فروشگاه حضوری داریم تا بتوانید کیفیت کالاها را از نزدیک لمس کنید.",
    tone: "bg-sale/10 text-sale",
  },
  {
    icon: ShieldCheck,
    title: "خرید امن و تضمین‌شده",
    text: "فاکتور رسمی، ۱۸ ماه ضمانت واقعی سازه‌های چوبی و ۷ روز مهلت مرجوعی برای اطمینان کامل شما از خرید.",
    tone: "bg-sky/20 text-sky",
  },
];

export function AboutCompany() {
  return (
    <section className="container-page py-16 md:py-24">
      <SectionHeading
        eyebrow="اصالت و اعتماد از سال ۱۳۸۹"
        title="داستان جهان کودک ابهر"
        subtitle="ما ترکیبی از هنر نجاران محلی و بهترین برندهای سیسمونی هستیم تا تجربه‌ای گرم و مطمئن برای فرزند شما بسازیم."
        align="center"
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {columns.map((c) => (
          <div key={c.title} className="group relative overflow-hidden rounded-[2.8rem] border-2 border-white/90 bg-white/40 p-8 shadow-lift transition-all duration-500 hover:bg-white/70 hover:shadow-deep hover:-translate-y-2">
            <span className={`inline-flex size-14 items-center justify-center rounded-2xl ${c.tone} mb-5 shadow-inner transition-transform group-hover:scale-110`}>
              <c.icon className="size-6" />
            </span>
            <h3 className="text-lg font-black text-foreground">{c.title}</h3>
            <p className="mt-3 text-sm leading-8 text-muted-foreground">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
        <Link 
          to="/about" 
          className="toy-button inline-flex items-center rounded-full bg-charcoal px-8 py-3.5 text-sm font-extrabold text-white shadow-lift transition-transform hover:scale-[1.03]"
        >
          بیشتر درباره ما
        </Link>
        <Link 
          to="/contact" 
          className="inline-flex items-center gap-2 rounded-full border-2 border-white/90 bg-white/80 px-8 py-3.5 text-sm font-bold text-foreground shadow-soft transition-all hover:border-brand hover:text-brand"
        >
          تماس با فروشگاه
        </Link>
        <div className="flex items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-xs font-black text-brand shadow-inner">
          <Sparkles className="size-3.5" />
          {toFaDigits("۰۲۴-۳۵۲۲۳۳۴۴")}
        </div>
      </div>
    </section>
  );
}
