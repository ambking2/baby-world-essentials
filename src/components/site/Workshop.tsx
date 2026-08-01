import workshopImage from "@/assets/workshop.jpg";
import { Button } from "@/components/ui/button";

const facts = [
  { label: "چوب مصرفی", value: "راش و MDF ضدآب" },
  { label: "زمان ساخت سفارشی", value: "۲۰ تا ۳۰ روز کاری" },
  { label: "گارانتی سازه", value: "۱۸ ماه" },
];

export function Workshop() {
  return (
    <section id="workshop" className="scroll-mt-28 border-y border-border bg-sand/60 py-14 md:py-20">
      <div className="container-page grid items-center gap-10 md:grid-cols-2">
        <img
          src={workshopImage}
          alt="ساخت بدنه تخت نوزاد در کارگاه نجاری جهان کودک"
          width={1400}
          height={1000}
          loading="lazy"
          className="aspect-[7/5] w-full rounded-3xl object-cover shadow-[var(--shadow-lift)]"
        />
        <div>
          <h2 className="text-xl font-bold md:text-2xl">سرویس خواب را خودمان می‌سازیم</h2>
          <p className="mt-4 text-sm leading-8 text-muted-foreground">
            کارگاه نجاری ما در ابهر است و تخت، دراور و کمد را بدون واسطه تولید می‌کنیم. اگر اندازه
            اتاق یا رنگ مورد نظرتان با مدل‌های آماده جور نیست، سفارش ساخت ثبت می‌شود؛ نقشه و رنگ
            پیش از شروع کار تأیید می‌گیریم. رنگ‌ها بر پایه آب و بدون بوی تند است.
          </p>

          <dl className="mt-7 grid gap-4 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd className="mt-2 text-sm font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>

          <Button variant="outline" className="mt-7 rounded-xl" asChild>
            <a href="tel:+982435223344">ثبت سفارش ساخت</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
