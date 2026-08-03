import { Star } from "lucide-react";

import workshop from "@/assets/workshop.jpg";
import { toFaDigits } from "@/lib/format";

const reviews = [
  {
    name: "زهرا محمدی",
    city: "ابهر",
    rating: 5,
    text: "سرویس خواب را با ابعاد اتاق خودمان سفارش دادیم. دوازده روزه آماده شد و خودشان در محل نصب کردند.",
  },
  {
    name: "مهدی رستمی",
    city: "خرمدره",
    rating: 4,
    text: "کالسکه را قسطی گرفتم، چک شش ماهه بدون هیچ سود اضافه. تحویل روز بعد در خرمدره.",
  },
  {
    name: "سمیه کریمی",
    city: "زنجان",
    rating: 5,
    text: "لباس‌ها واقعاً نخ پنبه بود و بعد از شست‌وشو آب نرفت. یک سایز بزرگ‌تر خریدم که پیشنهاد خودشان بود.",
  },
];

const stats = [
  { value: "۱۳۸۹", label: "سال شروع فعالیت فروشگاه" },
  { value: "+۶۲۰۰", label: "سفارش تحویل‌شده" },
  { value: "۴٫۶ از ۵", label: "میانگین امتیاز مشتریان" },
  { value: "۱۸ ماه", label: "گارانتی محصولات چوبی" },
];

export function CustomerTrust() {
  return (
    <section id="trust" className="scroll-mt-24 border-t border-border bg-secondary py-10">
      <div className="container-page grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-base font-bold text-foreground md:text-lg">نظر مشتریان فروشگاه</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            نظرها از خریداران حضوری و اینترنتی ثبت شده‌اند.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="flex h-full flex-col border border-border bg-card p-4">
                <div className="flex items-center gap-0.5" aria-label={`امتیاز ${r.rating} از ۵`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < r.rating ? "size-3.5 fill-clay text-clay" : "size-3.5 text-border"
                      }
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="mt-2 text-xs leading-6 text-foreground">{r.text}</blockquote>
                <figcaption className="mt-3 text-[11px] text-muted-foreground">
                  {r.name} — {r.city}
                </figcaption>
              </figure>
            ))}
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border border-border bg-card p-3">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-base font-bold text-foreground">{s.value}</span>
                  <span className="mt-1 block text-[11px] leading-5 text-muted-foreground">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="border border-border bg-card">
          <img
            src={workshop}
            alt="کارگاه نجاری فروشگاه جهان کودک در ابهر"
            width={640}
            height={420}
            loading="lazy"
            className="h-40 w-full object-cover"
          />
          <div className="p-4">
            <p className="text-[13px] font-bold text-foreground">فروشگاه و کارگاه، هر دو در ابهر</p>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              خیابان طالقانی، روبه‌روی بانک ملت، پلاک ۱۴۲. کالای چوبی را می‌توانید پیش از خرید در
              کارگاه ببینید. شنبه تا پنجشنبه، ۹ تا ۲۱.
            </p>
            <a
              href="tel:+982435223344"
              className="mt-3 block bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              تماس با فروشگاه: {toFaDigits("024-3522-3344")}
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
