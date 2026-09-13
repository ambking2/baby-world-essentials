import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Slide = {
  title: string;
  subtitle: string;
  body: string;
  cta: string;
  href: string;
  image: string;
};

const SLIDES: Array<Slide> = [
  {
    subtitle: "سرویس خواب نوردیک",
    title: "خوابی شیرین در بستری از طبیعت",
    body: "طراحی مینیمال و ارگونومیک با چوب طبیعی و رنگ‌های گیاهی برای سلامت نوزاد شما.",
    cta: "خرید سرویس خواب",
    href: "/category/servis-khab",
    image: "/images/cat-furniture.jpg",
  },
  {
    subtitle: "کالکشن جدید ۲۰۲۶",
    title: "لطافت و زیبایی در لباس نوزاد",
    body: "بهترین پارچه‌های پنبه‌ای و ارگانیک برای پوست حساس دلبند شما، با طراحی مدرن.",
    cta: "مشاهده لباس‌ها",
    href: "/category/lebas",
    image: "/images/cat-clothing.jpg",
  },
  {
    subtitle: "اسباب‌بازی آموزشی",
    title: "بازی، اولین مدرسهٔ کودک شماست",
    body: "مجموعه‌ای از اسباب‌بازی‌های هوشمند و چوبی برای رشد خلاقیت و مهارت‌های ظریف.",
    cta: "کاوش اسباب‌بازی‌ها",
    href: "/category/asbab-bazi",
    image: "/images/cat-toys.jpg",
  },
];

/** اسلایدر هیرو — مطابق مرجع: کارت گرد روی سطح بنفش‌ملایم، متن روی تصویر با گرادیان تیره. */
export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: "rtl" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    const timer = setInterval(() => emblaApi.scrollNext(), 7000);
    return () => {
      clearInterval(timer);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-surface-container-low py-8 md:py-12">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-lg">
          <div ref={emblaRef} className="w-full">
            <div className="flex">
              {SLIDES.map((slide, idx) => (
                <div key={idx} className="group relative min-w-0 flex-[0_0_100%]">
                  <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[2.2/1]">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-12">
                    <span className="mb-3 inline-block rounded-full bg-secondary-container/90 px-4 py-1 text-xs font-bold text-on-secondary backdrop-blur-sm">
                      {slide.subtitle}
                    </span>
                    <h2 className="font-display-lg text-display-lg-mobile max-w-xl font-extrabold leading-tight text-white drop-shadow-sm md:text-display-lg">
                      {slide.title}
                    </h2>
                    <p className="mt-3 hidden max-w-lg text-sm leading-7 text-white/85 md:block">{slide.body}</p>
                    <Link
                      to={slide.href}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/40 transition-transform hover:scale-105 active:scale-95"
                    >
                      {slide.cta}
                      <ChevronLeft className="size-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="اسلاید قبلی"
            className="absolute right-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-90 md:size-12"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="اسلاید بعدی"
            className="absolute left-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-90 md:size-12"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`اسلاید ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  selected === i ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
