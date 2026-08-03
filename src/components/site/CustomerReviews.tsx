import { Star } from "lucide-react";

import { toFaDigits } from "@/lib/format";

const reviews = [
  {
    name: "مریم رحیمی",
    city: "ابهر",
    rating: 5,
    body: "سرویس خواب را از کارگاه خودشان گرفتیم. سه هفته طول کشید ولی دقیقاً همان ابعادی بود که سفارش دادیم و رنگش هیچ بویی نداشت.",
  },
  {
    name: "سعید محمدی",
    city: "زنجان",
    rating: 4,
    body: "کالسکه را سفارش دادم؛ تحویل به زنجان دو روزه بود و بسته‌بندی سالم رسید.",
  },
  {
    name: "الهام کاظمی",
    city: "خرمدره",
    rating: 5,
    body: "برای سیسمونی کامل رفتم فروشگاه. آقای عسگری صبورانه توضیح داد چه چیزهایی لازم نیست بخرم؛ کمتر از بودجه‌ام خرج کردم.",
  },
];

export function CustomerReviews() {
  return (
    <section className="container-page py-10">
      <h2 className="text-center text-lg font-black text-foreground md:text-xl">
        نظر مشتری‌های فروشگاه
      </h2>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        نظرات ثبت‌شده خریداران حضوری و اینترنتی
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.name} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-0.5" aria-label={`امتیاز ${r.rating} از ۵`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < r.rating ? "size-4 fill-sun text-sun" : "size-4 text-muted-foreground/40"
                  }
                  aria-hidden="true"
                />
              ))}
            </div>
            <blockquote className="mt-3 text-[13px] leading-7 text-muted-foreground">
              {r.body}
            </blockquote>
            <figcaption className="mt-4 text-xs font-bold text-foreground">
              {r.name}
              <span className="font-normal text-muted-foreground"> — {r.city}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        میانگین امتیاز فروشگاه {toFaDigits("۴٫۷")} از {toFaDigits(5)} بر پایه{" "}
        {toFaDigits(412)} نظر ثبت‌شده
      </p>
    </section>
  );
}
