import { Link } from "@tanstack/react-router";

import hero from "@/assets/hero-nursery.jpg";
import workshop from "@/assets/workshop.jpg";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="container-page py-5">
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="relative overflow-hidden border border-border bg-sand">
          <img
            src={hero}
            alt="اتاق نوزاد با سرویس خواب چوبی جهان کودک"
            width={1200}
            height={600}
            className="h-56 w-full object-cover md:h-80"
          />
          <div className="absolute inset-y-0 start-0 flex w-full max-w-md flex-col justify-center gap-3 bg-background/80 p-6 md:p-8">
            <span className="w-fit bg-sale px-2 py-0.5 text-xs font-bold text-sale-foreground">
              فروش ویژه تابستان
            </span>
            <h2 className="text-lg font-bold text-foreground md:text-2xl">
              سرویس خواب چوبی ساخت کارگاه خودمان
            </h2>
            <p className="text-xs text-muted-foreground md:text-sm">
              تا ۱۵٪ تخفیف روی تخت و دراور راش، با امکان پرداخت در ۶ قسط بدون بهره.
            </p>
            <Button asChild size="sm" className="w-fit rounded-md">
              <Link to="/">مشاهده محصولات</Link>
            </Button>
          </div>
        </div>

        <div className="relative hidden overflow-hidden border border-border bg-sand lg:block">
          <img
            src={workshop}
            alt="کارگاه نجاری جهان کودک در ابهر"
            width={600}
            height={600}
            className="h-80 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-background/85 p-4">
            <p className="text-sm font-bold text-foreground">تولید در کارگاه خودمان</p>
            <p className="mt-1 text-xs text-muted-foreground">
              سفارش ابعاد و رنگ دلخواه، تحویل ۱۰ تا ۱۴ روز کاری.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
