import { BadgeCheck, Headphones, RotateCcw, Truck } from "lucide-react";

const items = [
  { icon: Truck, title: "ارسال به سراسر ایران", note: "تحویل رایگان در ابهر و زنجان" },
  { icon: BadgeCheck, title: "ضمانت اصالت کالا", note: "فاکتور رسمی برای همه سفارش‌ها" },
  { icon: RotateCcw, title: "۷ روز مهلت مرجوعی", note: "در صورت سالم بودن بسته‌بندی" },
  { icon: Headphones, title: "مشاوره خرید", note: "شنبه تا پنجشنبه، ۹ تا ۲۱" },
];

export function TrustSection() {
  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="container-page grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-background text-primary shadow-soft">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-foreground">{item.title}</p>
              <p className="text-[11px] text-muted-foreground">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
