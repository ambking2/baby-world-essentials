import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "سفارش سرویس خواب چند روزه آماده می‌شود؟",
    a: "مدل‌های موجود در فروشگاه همان روز تحویل داده می‌شود. سفارش ساخت با اندازه یا رنگ دلخواه بین ۲۰ تا ۳۰ روز کاری زمان می‌برد.",
  },
  {
    q: "برای خرید قسطی چه مدارکی لازم است؟",
    a: "کارت ملی، یک برگ چک یا سفته و یکی از مدارک شغلی مثل فیش حقوقی یا جواز کسب. اقساط شش‌ماهه و بدون سود است.",
  },
  {
    q: "ارسال به شهرهای دیگر انجام می‌دهید؟",
    a: "بله. در ابهر و خرمدره با خودروی فروشگاه ارسال می‌کنیم. برای زنجان و سایر شهرها بار با باربری فرستاده می‌شود و کرایه در مقصد پرداخت می‌گردد.",
  },
  {
    q: "امکان تعویض کالا وجود دارد؟",
    a: "کالای بازنشده و بدون استفاده تا هفت روز با ارائه فاکتور تعویض می‌شود. لباس‌های زیر و اقلام بهداشتی به دلیل مسائل بهداشتی مشمول تعویض نیستند.",
  },
  {
    q: "رنگ چوب برای نوزاد ایمن است؟",
    a: "رنگ‌های مصرفی پایه آب و بدون سرب هستند و پس از خشک شدن بو نمی‌دهند. برگه مشخصات رنگ در فروشگاه موجود است.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="container-page scroll-mt-28 pb-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-bold md:text-2xl">سؤال‌هایی که مشتری‌ها بیشتر می‌پرسند</h2>
        <Accordion type="single" collapsible className="mt-6">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-start text-sm">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-8 text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
