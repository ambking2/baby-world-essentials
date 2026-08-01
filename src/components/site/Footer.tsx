import { MapPin, Phone, Clock, Instagram } from "lucide-react";

import { categories } from "@/data/catalog";
import { toFaDigits } from "@/lib/format";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-sand">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
              ج ک
            </span>
            <span className="text-base font-bold">سیسمونی جهان کودک</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            فروش سیسمونی و تولید سرویس خواب چوبی نوزاد در ابهر. سفارش‌ها را می‌توانید حضوری در
            فروشگاه یا تلفنی ثبت کنید؛ ارسال به شهرهای استان زنجان با باربری انجام می‌شود.
          </p>
        </div>

        <nav aria-label="دسته‌بندی محصولات">
          <h2 className="text-sm font-semibold">دسته‌بندی محصولات</h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.slug}>
                <a href="#categories" className="hover:text-primary">
                  {c.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="راهنمای خرید">
          <h2 className="text-sm font-semibold">راهنمای خرید</h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            <li>
              <a href="#installment" className="hover:text-primary">
                شرایط خرید قسطی ۶ ماهه
              </a>
            </li>
            <li>
              <a href="#store" className="hover:text-primary">
                آدرس فروشگاه و ساعت کاری
              </a>
            </li>
            <li>
              <a href="#workshop" className="hover:text-primary">
                سفارش ساخت سرویس چوبی
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-primary">
                ارسال، تعویض و گارانتی
              </a>
            </li>
          </ul>
        </nav>

        <address className="not-italic">
          <h2 className="text-sm font-semibold">تماس با ما</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
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
              همه روزه ۹ تا ۲۱ • جمعه‌ها ۱۰ تا ۱۴
            </li>
            <li className="flex gap-2">
              <Instagram className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <a href="https://instagram.com" className="hover:text-primary">
                jahankoodak.abhar@
              </a>
            </li>
          </ul>
        </address>
      </div>

      <div className="border-t border-border/70">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {toFaDigits(1404)} سیسمونی جهان کودک — مدیریت: آقای عسگری</p>
          <p>تمام قیمت‌ها به تومان و شامل مالیات بر ارزش افزوده است.</p>
        </div>
      </div>
    </footer>
  );
}
