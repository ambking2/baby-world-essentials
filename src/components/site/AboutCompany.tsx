import { Link } from "@tanstack/react-router";
import { Store, ShieldCheck, Hammer } from "lucide-react";

import { SectionHeading } from "@/components/store/SectionHeading";

const columns = [
  {
    icon: Hammer,
    title: "کارگاه اختصاصی",
    text: "سرویس خواب، دراور و تخت را در کارگاه خودمان با چوب راش و متریال درجه‌یک می‌سازیم؛ با امکان شخصی‌سازی کامل.",
  },
  {
    icon: Store,
    title: "فروشگاه حضوری",
    text: "ما فقط یک سایت نیستیم. در قلب ابهر فروشگاه حضوری داریم تا بتوانید کیفیت کالاها را از نزدیک لمس کنید.",
  },
  {
    icon: ShieldCheck,
    title: "خرید امن",
    text: "فاکتور رسمی، ۱۸ ماه ضمانت واقعی سازه‌های چوبی و ۷ روز مهلت مرجوعی برای اطمینان کامل شما از خرید.",
  },
];

export function AboutCompany() {
  return (
    <section className="container-page py-20 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-3 lg:gap-24">
        {columns.map((c) => (
          <div key={c.title} className="text-center lg:text-start">
            <div className="mx-auto mb-8 flex size-12 items-center justify-center rounded-full bg-secondary lg:mx-0">
              <c.icon className="size-6 text-primary" />
            </div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground">{c.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
