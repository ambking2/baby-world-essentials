import { CreditCard, Headset, ShieldCheck, Truck } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "ارسال به سراسر ایران",
    text: "ارسال رایگان برای خرید بالای ۵٬۰۰۰٬۰۰۰ تومان",
  },
  { icon: CreditCard, title: "پرداخت قسطی", text: "۶ قسط ماهیانه بدون بهره با چک یا کارت" },
  { icon: ShieldCheck, title: "ضمانت کالا", text: "۷ روز مهلت تعویض، ۱۸ ماه گارانتی چوب" },
  { icon: Headset, title: "پشتیبانی فروشگاه", text: "شنبه تا پنجشنبه، ۹ تا ۲۱ – ۰۲۴-۳۵۲۲۳۳۴۴" },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-secondary">
      <div className="container-page grid grid-cols-2 gap-px md:grid-cols-4">
        {items.map((i) => (
          <div key={i.title} className="flex items-start gap-3 py-5">
            <i.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-bold text-foreground">{i.title}</p>
              <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{i.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
