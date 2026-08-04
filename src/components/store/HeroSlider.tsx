import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

type Slide = {
  title: string;
  highlight: string;
  body: string;
  cta: string;
  href: string;
  image: string;
  tone: string;
};

const SLIDES: Array<Slide> = [
  {
    title: "سرویس خواب نوزاد",
    highlight: "ساخت کارگاه خودمان",
    body: `چوب خشک‌شده، رنگ بدون سرب و ${toFaDigits(business.structureWarrantyMonths)} ماه ضمانت سازه. سارخ دلخواهتان را برایتان می‌سازیم.`,
    cta: "دیدن سرویس‌های خواب",
    href: "/category/servis-khab",
    image: "/images/hero-nursery.jpg",
    tone: "from-brand-soft",
  },
  {
    title: "کالسکه و تجهیزات سفر",
    highlight: "سبک، جمع‌شو و ایمن",
    body: "مدل‌های مناسب کوچه و خیابان شهر، با قابلیت تست حضوری در فروشگاه.",
    cta: "خرید کالسکه",
    href: "/category/kalaskeh",
    image: "/images/cat-stroller.jpg",
    tone: "from-sky",
  },
  {
    title: "لباس نوزاد و سرهمی",
    highlight: "پارچهٔ پنبه‌ای نرم",
    body: `انتخاب سایز هنگام ثبت سفارش — ارسال رایگان بالای ${formatToman(business.freeShippingThreshold)}.`,
    cta: "دیدن لباس‌ها",
    href: "/category/lebas",
    image: "/images/cat-clothing.jpg",
    tone: "from-mint",
  },
];

/** اسلایدر اصلی صفحهٔ اول با پخش خودکار و دکمه‌های جابجایی. */
export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: "rtl", align: "start" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();

    const timer = window.setInterval(() => emblaApi.scrollNext(), 6000);
    return () => {
      window.clearInterval(timer);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="container-page pt-5" aria-label="اسلایدر پیشنهادها">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {SLIDES.map((slide) => (
              <div key={slide.title} className="min-w-0 flex-[0_0_100%]">
                <div className="grid items-center gap-6 p-6 md:grid-cols-2 md:p-10">
                  <div className="space-y-4">
                    <span className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                      {slide.highlight}
                    </span>
                    <h2 className="text-2xl font-extrabold leading-tight text-foreground md:text-4xl">{slide.title}</h2>
                    <p className="max-w-md text-sm leading-7 text-muted-foreground">{slide.body}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={slide.href}
                        className="inline-flex items-center rounded-full bg-brand px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
                      >
                        {slide.cta}
                      </Link>
                      <a
                        href={business.phoneHref}
                        className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors hover:border-brand hover:text-brand"
                      >
                        مشاورهٔ تلفنی
                      </a>
                    </div>
                  </div>

                  <div className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-tl to-transparent p-2", slide.tone)}>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="aspect-[4/3] w-full rounded-2xl object-cover"
                      loading="eager"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="اسلاید قبل"
          className="absolute end-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-soft transition-colors hover:text-brand md:inline-flex"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="اسلاید بعد"
          className="absolute start-3 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-soft transition-colors hover:text-brand md:inline-flex"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>

        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`اسلاید ${index + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === selected ? "w-7 bg-brand" : "w-2.5 bg-border",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
