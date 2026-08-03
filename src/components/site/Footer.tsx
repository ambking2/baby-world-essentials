import { Clock, MapPin, Phone } from "lucide-react";

import { categories } from "@/data/catalog";
import { toFaDigits } from "@/lib/format";

const help = [
  "روش‌های پرداخت و اقساط",
  "شرایط ارسال و هزینه‌ها",
  "مرجوعی و تعویض کالا",
  "راهنمای انتخاب سرویس خواب",
  "سفارش ساخت با ابعاد دلخواه",
];

export function Footer() {
  return (
    <footer id="footer" className="mt-8 border-t border-border bg-secondary">
      <div className="container-page grid gap-8 py-10 md:grid-cols-4">
        <div>
          <p className="text-sm font-bold text-foreground">جهان کودک</p>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            فروشگاه سیسمونی و اتاق کودک در ابهر، با کارگاه تولید چوب. از سال ۱۳۸۹ فروش حضوری و از
            سال ۱۴۰۱ ارسال به سراسر کشور. مدیریت: آقای عسگری.
          </p>
        </div>

        <div>
          <p className="text-[13px] font-bold text-foreground">دسته‌بندی‌ها</p>
          <ul className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground">
            {categories.map((c) => (
              <li key={c.slug}>
                <a href="#categories" className="hover:text-primary">
                  {c.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[13px] font-bold text-foreground">راهنمای خرید</p>
          <ul className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground">
            {help.map((h) => (
              <li key={h}>
                <a href="#trust" className="hover:text-primary">
                  {h}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[13px] font-bold text-foreground">تماس و آدرس</p>
          <ul className="mt-3 flex flex-col gap-3 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              ابهر، خیابان طالقانی، روبه‌روی بانک ملت، پلاک ۱۴۲
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <a href="tel:+982435223344" className="hover:text-primary">
                {toFaDigits("024-3522-3344")}
              </a>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              شنبه تا پنجشنبه، ۹ صبح تا ۹ شب
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-4 text-[11px] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {toFaDigits(1405)} فروشگاه جهان کودک ابهر. تمام حقوق محفوظ است.</p>
          <p>پرداخت امن از طریق درگاه بانکی و پرداخت در محل برای ابهر و خرمدره.</p>
        </div>
      </div>
    </footer>
  );
}
