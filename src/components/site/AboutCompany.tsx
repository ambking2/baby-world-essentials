import { Link } from "@tanstack/react-router";

import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";
import { toFaDigits } from "@/lib/format";

const columns = [
  {
    n: "۱",
    title: "کارگاه چوب خودمان",
    text: "سرویس خواب، دراور و تخت را در کارگاه ابهر با چوب راش خشک‌شده می‌سازیم؛ سفارش ابعاد دلخواه هم می‌گیریم.",
  },
  {
    n: "۲",
    title: "فروشگاه حضوری در ابهر",
    text: "خیابان طالقانی، روبه‌روی بانک ملت. کالاها را از نزدیک ببینید و بعد تصمیم بگیرید؛ شنبه تا پنجشنبه ۹ تا ۲۱.",
  },
  {
    n: "۳",
    title: "خرید بدون ریسک",
    text: "فاکتور رسمی برای همه سفارش‌ها، ۱۸ ماه ضمانت کالاهای چوبی و ۷ روز مهلت مرجوعی کالای پلمب.",
  },
];

export function AboutCompany() {
  return (
    <section className="container-page py-10 md:py-14">
      <SectionHeading
        eyebrow="از سال ۱۳۸۹ در ابهر"
        title="درباره فروشگاه جهان کودک"
        subtitle="یک مغازه واقعی سیسمونی با یک کارگاه چوب پشت آن. هرچه در سایت می‌بینید در همان فروشگاه هم موجود است و می‌توانید حضوری تحویل بگیرید."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
        {columns.map((c) => (
          <div key={c.n} className="flex gap-3 text-start">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">
              {c.n}
            </span>
            <div>
              <h3 className="text-sm font-black text-foreground">{c.title}</h3>
              <p className="mt-1.5 text-xs leading-7 text-muted-foreground">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-full px-6">
          <Link to="/about">درباره ما</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link to="/contact">تماس با فروشگاه</Link>
        </Button>
        <span className="text-[11px] text-muted-foreground">
          {toFaDigits("۰۲۴-۳۵۲۲۳۳۴۴")}
        </span>
      </div>
    </section>
  );
}
