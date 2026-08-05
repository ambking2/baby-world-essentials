import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, PhoneCall, Sparkles, Star } from "lucide-react";
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
  badge: string;
};

const SLIDES: Array<Slide> = [
  {
    title: "اتاق نوزاد را گرم، لطیف و واقعی بچینید",
    highlight: "سرویس خواب و دکور اتاق کودک",
    body: `چوب سالم، رنگ بی‌خطر و ${toFaDigits(business.structureWarrantyMonths)} ماه ضمانت سازه؛ با امکان سفارش‌سازی در کارگاه خودمان.`,
    cta: "دیدن سرویس‌های خواب",
    href: "/category/servis-khab",
    image: "/images/hero-nursery.jpg",
    tone: "from-[#ffe0c6] via-[#fff0e4] to-[#fffdf8]",
    badge: "محبوب خانواده‌ها",
  },
  {
    title: "لباس نوزاد و سرهمی‌هایی که واقعاً راحت‌اند",
    highlight: "پارچهٔ پنبه‌ای نرم و سایزبندی واقعی",
    body: `از بادی و سرهمی تا ست‌های مهمانی؛ با ارسال رایگان خریدهای بالای ${formatToman(business.freeShippingThreshold)}.`,
    cta: "خرید لباس نوزاد",
    href: "/category/lebas",
    image: "/images/cat-clothing.jpg",
    tone: "from-[#ffd8e5] via-[#fff0f5] to-[#fffdf8]",
    badge: "فروش ویژهٔ امروز",
  },
  {
    title: "برای بیرون رفتن آماده باشید؛ سبک، امن و خوش‌دست",
    highlight: "کالسکه، کریر و تجهیزات سفر کودک",
    body: "مدل‌های مناسب استفادهٔ روزمره، تست‌پذیر در فروشگاه، با مشاوره قبل از خرید و انتخاب دقیق‌تر.",
    cta: "مشاهده کالسکه‌ها",
    href: "/category/kalaskeh",
    image: "/images/cat-stroller.jpg",
    tone: "from-[#d8ecff] via-[#eef7ff] to-[#fffdf8]",
    badge: "پیشنهاد سفر و گردش",
  },
];

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
    <section className="container-page pt-3" aria-label="اسلایدر پیشنهادها">
      <div className="storybook-panel relative overflow-hidden shadow-deep ring-1 ring-white/50">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {SLIDES.map((slide) => (
              <div key={slide.title} className="min-w-0 flex-[0_0_100%]">
                <div className={cn("relative grid min-h-[540px] items-center gap-8 overflow-hidden bg-gradient-to-br px-6 pb-20 pt-8 md:grid-cols-[1.05fr_0.95fr] md:px-10 lg:px-14", slide.tone)}>
                  <div className="absolute left-10 top-10 size-32 rounded-full bg-white/35 blur-3xl" />
                  <div className="absolute bottom-10 right-8 size-40 rounded-full bg-brand/10 blur-3xl" />

                  <div className="relative z-10 space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-[11px] font-extrabold text-brand shadow-soft">
                      <Sparkles className="size-3.5" aria-hidden />
                      {slide.badge}
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-bold text-brand">{slide.highlight}</p>
                      <h2 className="max-w-xl text-3xl font-black leading-[1.2] text-foreground md:text-5xl">
                        {slide.title}
                      </h2>
                    </div>
                    <p className="max-w-lg text-sm leading-8 text-foreground/75 md:text-base">{slide.body}</p>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={slide.href}
                        className="toy-button inline-flex items-center rounded-full bg-gradient-to-r from-brand to-sale px-8 py-4 text-base font-extrabold text-primary-foreground shadow-lift transition-transform hover:scale-[1.04] active:scale-95"
                      >
                        {slide.cta}
                      </Link>
                      <a
                        href={business.phoneHref}
                        className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-6 py-4 text-sm font-bold text-foreground shadow-soft transition-all hover:border-brand hover:bg-white hover:text-brand hover:shadow-lift"
                      >
                        <PhoneCall className="size-4" aria-hidden />
                        مشاورهٔ تلفنی
                      </a>
                    </div>

                    <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.8rem] border border-white/90 bg-white/80 p-5 shadow-soft transition-transform hover:-translate-y-1">
                        <p className="text-[11px] font-bold text-muted-foreground">ارسال رایگان</p>
                        <p className="mt-1 text-sm font-extrabold text-foreground">بالای {formatToman(business.freeShippingThreshold)}</p>
                      </div>
                      <div className="rounded-[1.8rem] border border-white/90 bg-white/80 p-5 shadow-soft transition-transform hover:-translate-y-1">
                        <p className="text-[11px] font-bold text-muted-foreground">ضمانت سازه</p>
                        <p className="mt-1 text-sm font-extrabold text-foreground">{toFaDigits(business.structureWarrantyMonths)} ماه واقعی</p>
                      </div>
                      <div className="rounded-[1.8rem] border border-white/90 bg-white/80 p-5 shadow-soft transition-transform hover:-translate-y-1">
                        <p className="text-[11px] font-bold text-muted-foreground">پشتیبانی خرید</p>
                        <p className="mt-1 text-sm font-extrabold text-foreground">{business.city} و سراسر ایران</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex justify-center md:justify-end">
                    <div className="relative w-full max-w-[520px]">
                      <div className="absolute inset-0 scale-95 rounded-[3rem] bg-brand/10 blur-[80px]" />
                      <div className="relative overflow-hidden rounded-[3rem] border-4 border-white/90 bg-white/70 p-4 shadow-deep backdrop-blur-md">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="aspect-[4/4.1] w-full rounded-[2.4rem] object-cover shadow-inner"
                          loading="eager"
                        />
                      </div>
                      <div className="absolute -bottom-6 -left-4 rounded-[1.8rem] border-2 border-white/90 bg-white/95 px-5 py-4 shadow-deep ring-4 ring-brand/5">
                        <p className="text-[11px] font-bold text-muted-foreground">تجربهٔ محبوب مشتریان</p>
                        <p className="mt-1 flex items-center gap-1 text-sm font-extrabold text-foreground">
                          <Star className="size-4 fill-brand text-brand" aria-hidden />
                          ۴.۸ از ۵ در خریدهای ثبت‌شده
                        </p>
                      </div>
                    </div>
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
          className="absolute end-4 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/85 shadow-soft transition-colors hover:text-brand md:inline-flex"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="اسلاید بعد"
          className="absolute start-4 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/85 shadow-soft transition-colors hover:text-brand md:inline-flex"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>

        <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`اسلاید ${index + 1}`}
              className={cn(
                "h-2 rounded-full transition-all",
                index === selected ? "w-8 bg-brand" : "w-2.5 bg-foreground/20",
              )}
            />
          ))}
        </div>

        <div className="cloud-bottom" />
        <div className="zigzag-bottom" />
      </div>
    </section>
  );
}
