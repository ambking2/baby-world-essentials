import { Instagram } from "lucide-react";

import toys from "@/assets/cat-toys.jpg";
import clothing from "@/assets/cat-clothing.jpg";
import feeding from "@/assets/cat-feeding.jpg";
import furniture from "@/assets/cat-furniture.jpg";

const shots = [
  { src: toys, alt: "اسباب‌بازی چوبی در ویترین فروشگاه" },
  { src: clothing, alt: "ست لباس نوزاد نخ پنبه" },
  { src: feeding, alt: "لوازم شیردهی و تغذیه" },
  { src: furniture, alt: "سرویس خواب چوبی ساخت کارگاه" },
];

export function InstagramStrip() {
  return (
    <section className="container-page py-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-black text-foreground md:text-xl">اینستاگرام فروشگاه</h2>
        <a
          href="https://instagram.com"
          className="flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-primary hover:bg-secondary/70"
        >
          <Instagram className="size-4" aria-hidden="true" />
          jahankoodak@
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {shots.map((s) => (
          <a
            key={s.alt}
            href="https://instagram.com"
            className="group relative overflow-hidden rounded-2xl"
          >
            <img
              src={s.src}
              alt={s.alt}
              width={600}
              height={600}
              loading="lazy"
              className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
