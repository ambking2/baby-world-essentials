import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "انتخاب کالا در فروشگاه",
    body: "اقلام مورد نظر را حضوری انتخاب می‌کنید یا لیست خرید را تلفنی می‌فرستید.",
  },
  {
    title: "پرداخت ۴۰٪ به‌عنوان پیش‌پرداخت",
    body: "مابقی مبلغ در شش قسط ماهانه تقسیم می‌شود؛ بدون سود و کارمزد.",
  },
  {
    title: "ثبت چک یا سفته",
    body: "با ارائه کارت ملی، فیش حقوقی یا جواز کسب، اقساط ثبت و کالا همان روز تحویل می‌شود.",
  },
];

export function Installment() {
  return (
    <section id="installment" className="container-page scroll-mt-28 py-14 md:py-20">
      <div className="grid gap-8 rounded-3xl bg-installment p-6 md:grid-cols-[1fr_1.2fr] md:p-10">
        <div>
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            خرید سیسمونی با اقساط ۶ ماهه
          </h2>
          <p className="mt-4 text-sm leading-8 text-installment-foreground">
            سرویس خواب و اقلام بالای دو میلیون تومان را می‌توانید قسطی بخرید. قسط‌بندی توسط خود
            فروشگاه انجام می‌شود و نیازی به بانک یا اپلیکیشن واسط نیست.
          </p>
          <div className="mt-6 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <p className="text-xs text-muted-foreground">نمونه محاسبه سرویس خواب آرتا</p>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">مبلغ کل</dt>
                <dd className="font-medium">۲۸٬۵۰۰٬۰۰۰ تومان</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">پیش‌پرداخت</dt>
                <dd className="font-medium">۱۱٬۴۰۰٬۰۰۰ تومان</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">۶ قسط ماهانه</dt>
                <dd className="font-medium">۲٬۸۵۰٬۰۰۰ تومان</dd>
              </div>
            </dl>
          </div>
          <Button className="mt-6 rounded-xl" asChild>
            <a href="tel:+982435223344">تماس برای بررسی اقساط</a>
          </Button>
        </div>

        <ol className="flex flex-col gap-4">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="flex gap-4 rounded-2xl bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-primary">
                {["۱", "۲", "۳"][i]}
              </span>
              <div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
