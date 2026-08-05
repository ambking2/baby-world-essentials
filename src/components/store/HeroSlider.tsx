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
    title: "سادگی و آرامش در اتاق نوزاد",
    subtitle: "مجموعه جدید سرویس خواب نوردیک",
    body: "طراحی شده با الهام از طبیعت، با استفاده از متریال‌های طبیعی و رنگ‌های آرام‌بخش برای بهترین شروع زندگی دلبند شما.",
    cta: "مشاهده کالکشن",
    href: "/category/servis-khab",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop",
  },
  {
    title: "لطافت بی‌نظیر برای پوست‌های حساس",
    subtitle: "پوشاک ۱۰۰٪ پنبه ارگانیک",
    body: "ما معتقدیم کیفیت در جزئیات است. لباس‌هایی که نه تنها زیبا هستند، بلکه نهایت راحتی را برای نوزاد شما فراهم می‌کنند.",
    cta: "خرید لباس",
    href: "/category/lebas",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=2075&auto=format&fit=crop",
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
    <section className="relative h-[600px] w-full overflow-hidden bg-muted/20 lg:h-[700px]">
      <div ref={emblaRef} className="h-full cursor-grab active:cursor-grabbing">
        <div className="flex h-full">
          {SLIDES.map((slide, idx) => (
            <div key={idx} className="relative h-full min-w-0 flex-[0_0_100%]">
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover object-center brightness-[0.95]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent lg:hidden" />
              </div>
              
              <div className="container-page relative flex h-full items-center">
                <div className="max-w-2xl animate-fade-in px-4 lg:px-0">
                  <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-primary lg:text-sm">
                    {slide.subtitle}
                  </span>
                  <h2 className="mb-6 text-4xl font-bold leading-tight text-foreground lg:text-6xl">
                    {slide.title}
                  </h2>
                  <p className="mb-10 text-base leading-relaxed text-muted-foreground lg:text-lg">
                    {slide.body}
                  </p>
                  <div className="flex gap-4">
                    <Link to={slide.href} className="btn-primary">
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="container-page absolute bottom-12 z-10 flex justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="flex size-12 items-center justify-center rounded-full border border-border bg-white transition-premium hover:bg-secondary shadow-sm"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="flex size-12 items-center justify-center rounded-full border border-border bg-white transition-premium hover:bg-secondary shadow-sm"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>
        
        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "h-1 transition-all duration-300",
                selected === i ? "w-8 bg-primary" : "w-4 bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
