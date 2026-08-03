import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone, Send } from "lucide-react";

import { toFaDigits } from "@/lib/format";

const help = [
  { to: "/contact", label: "تماس با فروشگاه" },
  { to: "/contact", label: "رویه ارسال" },
  { to: "/contact", label: "شرایط مرجوعی" },
  { to: "/about", label: "درباره فروشگاه" },
] as const;

const shop = [
  { to: "/shop", label: "همه کالاها" },
  { to: "/offers", label: "تخفیف‌های این هفته" },
  { to: "/categories", label: "دسته‌بندی‌ها" },
  { to: "/brands", label: "برندها" },
] as const;

export function Footer() {
  return (
    <footer className="mt-16 bg-[oklch(0.28_0.08_290)] text-[oklch(0.93_0.02_290)]">
      <div className="container-page grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-black text-background">جهان کودک</p>
          <p className="mt-3 text-sm leading-7 text-[oklch(0.83_0.03_290)]">
            فروشگاه سیسمونی جهان کودک از سال ۱۳۹۲ در ابهر فعال است. سرویس خواب چوبی را در کارگاه
            خودمان می‌سازیم و بقیه کالاها را مستقیم از واردکننده تهیه می‌کنیم.
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href="https://instagram.com"
              aria-label="اینستاگرام جهان کودک"
              className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Instagram className="size-4" aria-hidden="true" />
            </a>
            <a
              href="https://t.me"
              aria-label="تلگرام جهان کودک"
              className="grid size-9 place-items-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Send className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-background">فروشگاه</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {shop.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-[oklch(0.85_0.03_290)] hover:text-background">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-background">راهنمای خرید</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {help.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-[oklch(0.85_0.03_290)] hover:text-background">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-background">فروشگاه ابهر</p>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-[oklch(0.85_0.03_290)]">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              زنجان، ابهر، خیابان طالقانی، روبه‌روی بانک ملت، پلاک {toFaDigits(142)}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <a href="tel:+982435223344">{toFaDigits("024-35223344")}</a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              info@jahankoodak.ir
            </li>
            <li>شنبه تا پنجشنبه، {toFaDigits("۹")} تا {toFaDigits("۲۱")}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-[oklch(0.8_0.03_290)]">
        © {toFaDigits(1404)} فروشگاه جهان کودک — مدیریت: آقای عسگری
      </div>
    </footer>
  );
}
