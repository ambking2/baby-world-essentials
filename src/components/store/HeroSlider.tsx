import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ShieldCheck, Truck, RefreshCcw, CreditCard } from "lucide-react";
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
    subtitle: "کالکشن جدید ۲۰۲۶",
    title: "آرامش و لطافت در دنیای نوزاد شما",
    body: "مجموعه‌ای از بهترین برندهای جهانی و تولیدات اختصاصی کارگاه با بالاترین استاندارد کیفی برای دلبند شما.",
    cta: "مشاهده جدیدترین‌ها",
    href: "/search",
    image: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=2072&auto=format&fit=crop",
  },
  {
    subtitle: "سرویس خواب نوردیک",
    title: "خوابی شیرین در بستری از طبیعت",
    body: "طراحی مینیمال و ارگونومیک با استفاده از چوب طبیعی و رنگ‌های گیاهی برای سلامت نوزاد شما.",
    cta: "خرید سرویس خواب",
    href: "/category/servis-khab",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop",
  },
];

export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: "rtl" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    const timer = setInterval(() => emblaApi.scrollNext(), 8000);
    return () => {
      clearInterval(timer);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <section className="relative h-[550px] w-full overflow-hidden bg-white lg:h-[680px]">
        <div ref={emblaRef} className="h-full">
          <div className="flex h-full">
            {SLIDES.map((slide, idx) => (
              <div key={idx} className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden">
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-full w-full object-cover object-center transition-transform duration-[10s] scale-105 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                
                <div className="container-page relative flex h-full items-center">
                  <div className="max-w-2xl px-4 lg:px-0">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary sm:text-[11px]">
                        {slide.subtitle}
                      </span>
                    </div>
                    <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-900 lg:text-6xl">
                      {slide.title}
                    </h2>
                    <p className="mb-8 max-w-lg text-sm leading-relaxed text-gray-600 lg:text-lg">
                      {slide.body}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link to={slide.href} className="btn-primary">
                        {slide.cta}
                      </Link>
                      <Link to="/about" className="btn-secondary">
                        درباره ما
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="container-page absolute bottom-12 z-10 hidden lg:block">
          <div className="flex items-center gap-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "h-1.5 transition-all duration-500 rounded-full",
                  selected === i ? "w-12 bg-primary" : "w-3 bg-white/50 hover:bg-white"
                )}
              />
            ))}
          </div>
        </div>

        {/* Arrow Navigation */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-4 lg:left-auto lg:right-24 lg:bottom-12 lg:translate-x-0">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="flex size-10 items-center justify-center rounded-full border border-gray-900/10 bg-white/90 text-gray-900 shadow-premium transition-all hover:bg-primary hover:text-white lg:size-12"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="flex size-10 items-center justify-center rounded-full border border-gray-900/10 bg-white/90 text-gray-900 shadow-premium transition-all hover:bg-primary hover:text-white lg:size-12"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>
      </section>

      {/* Trust Badges - Horizontal Benefits Section */}
      <div className="relative z-20 -mt-10 lg:-mt-16 container-page">
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-white p-6 shadow-xl lg:grid-cols-4 lg:p-10">
          <div className="flex items-center gap-4 border-l border-border/50 pl-4 last:border-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary lg:size-12">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-foreground">محصولات اصلی</h4>
              <p className="mt-1 text-[11px] text-muted-foreground">تضمین ۱۰۰٪ کیفیت</p>
            </div>
          </div>
          <div className="flex items-center gap-4 lg:border-l lg:border-border/50 lg:pl-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary lg:size-12">
              <Truck className="size-6" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-foreground">ارسال سریع</h4>
              <p className="mt-1 text-[11px] text-muted-foreground">به سراسر ایران</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l border-border/50 pl-4 max-lg:hidden">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary lg:size-12">
              <RefreshCcw className="size-6" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-foreground">مرجوع کالا</h4>
              <p className="mt-1 text-[11px] text-muted-foreground">تا ۷ روز کاری</p>
            </div>
          </div>
          <div className="flex items-center gap-4 max-lg:hidden">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary lg:size-12">
              <CreditCard className="size-6" />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-foreground">پرداخت امن</h4>
              <p className="mt-1 text-[11px] text-muted-foreground">درگاه‌های معتبر بانکی</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
