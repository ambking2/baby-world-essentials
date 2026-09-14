import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Slide = {
  alt: string;
  slug: string;
  image: string;
};

const SLIDES: Array<Slide> = [
  {
    alt: "سرویس خواب نوزاد",
    slug: "servis-khab",
    image: "/images/hero-nursery.jpg",
  },
  {
    alt: "کالکشن پوشاک نوزاد",
    slug: "lebas",
    image: "/images/hero-kid.png",
  },
  {
    alt: "اسباب‌بازی آموزشی",
    slug: "asbab-bazi",
    image: "/images/cat-toys.jpg",
  },
];

/** اسلایدر تمام‌عرض و بدون متن — هر اسلاید یک بنر کلیک‌پذیر به مقصد خودش. */
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
    <section className="relative w-full">
      <div ref={emblaRef} className="w-full overflow-hidden">
        <div className="flex">
          {SLIDES.map((slide, idx) => (
            <div key={idx} className="group relative min-w-0 flex-[0_0_100%]">
              <Link
                to="/category/$slug"
                params={{ slug: slide.slug }}
                aria-label={slide.alt}
                className="block h-[45vh] max-h-[620px] min-h-[280px] w-full sm:h-[55vh] lg:h-[68vh]"
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="h-full w-full object-cover transition-transform duration-[6s] ease-out group-hover:scale-[1.04]"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="بنر قبلی"
        className="absolute right-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-primary shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-90 md:size-12"
      >
        <ChevronRight className="size-5" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        aria-label="بنر بعدی"
        className="absolute left-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-primary shadow-md backdrop-blur-sm transition-all hover:bg-white active:scale-90 md:size-12"
      >
        <ChevronLeft className="size-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`بنر ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              selected === i ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </section>
  );
}
