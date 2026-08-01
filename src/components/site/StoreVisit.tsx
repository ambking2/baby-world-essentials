import { Clock, MapPin, Phone, Truck } from "lucide-react";

import { toFaDigits } from "@/lib/format";

const items = [
  {
    icon: MapPin,
    title: "آدرس فروشگاه",
    body: "ابهر، خیابان طالقانی، روبه‌روی بانک ملت، پلاک ۱۴۲",
  },
  { icon: Clock, title: "ساعت کاری", body: "شنبه تا پنجشنبه ۹ تا ۲۱ • جمعه ۱۰ تا ۱۴" },
  {
    icon: Truck,
    title: "ارسال",
    body: "ابهر و خرمدره با نیسان فروشگاه؛ سایر شهرها با باربری، هزینه پس‌کرایه",
  },
  { icon: Phone, title: "تماس و مشاوره", body: toFaDigits("024-3522-3344") },
];

export function StoreVisit() {
  return (
    <section id="store" className="container-page scroll-mt-28 py-14 md:py-20">
      <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-center">
        <div>
          <h2 className="text-xl font-bold md:text-2xl">قبل از خرید، حضوری ببینید</h2>
          <p className="mt-4 text-sm leading-8 text-muted-foreground">
            سیزده سال است در ابهر کار می‌کنیم و بیشتر مشتری‌هایمان با معرفی خانواده‌ها می‌آیند.
            کیفیت چوب، ایمنی نرده‌ها و جنس پارچه‌ها چیزهایی است که بهتر است از نزدیک ببینید. برای
            دیدن سرویس‌های آماده تحویل، سری به فروشگاه بزنید یا تلفنی وقت بگیرید.
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map((i) => (
              <div key={i.title} className="rounded-2xl border border-border bg-card p-4">
                <dt className="flex items-center gap-2 text-sm font-semibold">
                  <i.icon className="size-4 text-primary" aria-hidden="true" />
                  {i.title}
                </dt>
                <dd className="mt-2 text-sm leading-7 text-muted-foreground">{i.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-soft)]">
          <iframe
            title="موقعیت فروشگاه سیسمونی جهان کودک روی نقشه"
            src="https://www.openstreetmap.org/export/embed.html?bbox=49.19%2C36.13%2C49.24%2C36.16&layer=mapnik"
            className="h-80 w-full border-0 md:h-96"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
