import { Link } from "@tanstack/react-router";

import promoToys from "@/assets/promo-toys.png";
import promoBoy from "@/assets/promo-boy.png";
import promoGirl from "@/assets/promo-girl.png";
import { Button } from "@/components/ui/button";

export function PromoTiles() {
  return (
    <section className="container-page py-8">
      <div className="grid gap-4">
        <div className="grid items-center gap-4 overflow-hidden rounded-2xl bg-mint p-6 md:grid-cols-2 md:p-8">
          <div>
            <h2 className="text-xl font-black text-foreground md:text-2xl">
              ٪۱۵ تخفیف روی اسباب‌بازی چوبی
            </h2>
            <p className="mt-2 max-w-md text-sm leading-7 text-foreground/75">
              تا پایان مرداد روی همه اسباب‌بازی‌های چوبی ساخت کارگاه، تخفیف ۱۵ درصدی داریم. تعداد
              محدود است و فقط تا اتمام موجودی انبار.
            </p>
            <Button asChild className="mt-5 rounded-full px-6">
              <Link to="/category/$slug" params={{ slug: "asbab-bazi" }}>
                دیدن اسباب‌بازی‌ها
              </Link>
            </Button>
          </div>
          <img
            src={promoToys}
            alt="مجموعه اسباب‌بازی‌های چوبی و عروسک"
            width={1024}
            height={768}
            loading="lazy"
            className="mx-auto w-64 md:w-80"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-cream p-6">
            <div>
              <h3 className="text-lg font-black text-foreground">پوشاک پسرانه</h3>
              <p className="mt-2 max-w-[16rem] text-xs leading-6 text-foreground/70">
                بادی، سرهمی و ست بیرون‌رو نخ پنبه، سایز ۰ تا ۲۴ ماه.
              </p>
              <Button asChild size="sm" className="mt-4 rounded-full px-5">
                <Link to="/category/$slug" params={{ slug: "lebas" }}>
                  خرید
                </Link>
              </Button>
            </div>
            <img
              src={promoBoy}
              alt="نوزاد پسر با لباس آبی"
              width={768}
              height={768}
              loading="lazy"
              className="w-32 md:w-40"
            />
          </div>

          <div className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-sky p-6">
            <div>
              <h3 className="text-lg font-black text-foreground">اتاق دخترانه</h3>
              <p className="mt-2 max-w-[16rem] text-xs leading-6 text-foreground/70">
                سرویس خواب، دراور و دکور اتاق با رنگ‌های پایه آب و بی‌بو.
              </p>
              <Button asChild size="sm" className="mt-4 rounded-full px-5">
                <Link to="/category/$slug" params={{ slug: "dekor" }}>
                  خرید
                </Link>
              </Button>
            </div>
            <img
              src={promoGirl}
              alt="نوزاد دختر در حال بازی"
              width={768}
              height={768}
              loading="lazy"
              className="w-32 md:w-40"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
