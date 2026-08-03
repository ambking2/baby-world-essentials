import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import hero from "@/assets/hero-nursery.jpg";
import workshop from "@/assets/workshop.jpg";
import stroller from "@/assets/cat-stroller.jpg";
import { categories } from "@/data/catalog";

export function PromoBanner() {
  return (
    <section className="container-page py-4">
      <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label="فهرست دسته‌بندی‌ها"
          className="hidden border border-border bg-card lg:block"
        >
          <p className="border-b border-border bg-secondary px-4 py-2.5 text-[13px] font-bold text-foreground">
            دسته‌بندی محصولات
          </p>
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/"
                  className="flex items-center justify-between border-b border-border/70 px-4 py-2.5 text-[13px] text-foreground last:border-b-0 hover:bg-accent"
                >
                  {c.title}
                  <ChevronLeft className="size-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
          <div className="grid border border-border bg-card sm:grid-cols-2">
            <div className="flex flex-col justify-center gap-3 p-6">
              <span className="w-fit bg-sale px-2 py-0.5 text-[11px] font-bold text-sale-foreground">
                تخفیف تا ۱۵٪
              </span>
              <h2 className="text-lg font-bold leading-7 text-foreground md:text-xl">
                سرویس خواب چوبی، ساخت کارگاه خودمان در ابهر
              </h2>
              <p className="text-xs leading-6 text-muted-foreground">
                چوب راش، ابعاد و رنگ سفارشی، تحویل ۱۰ تا ۱۴ روز کاری. پرداخت نقدی یا ۶ قسط ماهیانه.
              </p>
              <Link
                to="/"
                className="w-fit bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                دیدن سرویس‌های خواب
              </Link>
            </div>
            <img
              src={hero}
              alt="اتاق نوزاد با تخت چوبی جهان کودک"
              width={800}
              height={800}
              className="h-48 w-full object-cover sm:h-full"
            />
          </div>

          <div className="grid gap-3">
            <PromoTile
              image={stroller}
              title="کالسکه و کریر"
              note="ارسال رایگان بالای ۵ میلیون تومان"
            />
            <PromoTile
              image={workshop}
              title="سفارش ساخت اختصاصی"
              note="اندازه‌گیری اتاق و طراحی رایگان"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PromoTile({ image, title, note }: { image: string; title: string; note: string }) {
  return (
    <Link
      to="/"
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border border-border bg-card p-3 hover:border-primary/50"
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-foreground">{title}</p>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{note}</p>
      </div>
      <img
        src={image}
        alt=""
        width={160}
        height={160}
        loading="lazy"
        className="size-20 shrink-0 object-cover"
      />
    </Link>
  );
}
