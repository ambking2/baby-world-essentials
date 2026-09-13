import { Link } from "@tanstack/react-router";
import { Cloud, Instagram, Mail, MapPin, Phone, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

import { business } from "@/data/business";
import { toFaDigits } from "@/lib/format";
import type { Category } from "@/server/repo/catalog";

type SiteFooterProps = {
  categories: Array<Category>;
  onSubscribe?: (email: string) => void;
  subscribing?: boolean;
};

export function SiteFooter({ categories, onSubscribe, subscribing = false }: SiteFooterProps) {
  const [email, setEmail] = useState("");

  const quickLinks = [
    { label: "فروشگاه", href: "/shop" },
    { label: "تخفیف‌های ویژه", href: "/offers" },
    { label: "برندها", href: "/brands" },
    { label: "مجله آموزشی", href: "/blog" },
    { label: "درباره ما", href: "/about" },
  ];

  const serviceLinks = [
    { label: "پیگیری سفارش", href: "/account/orders" },
    { label: "سوالات متداول", href: "/faq" },
    { label: "تماس با ما", href: "/contact" },
    { label: "فروشگاه‌های حضوری", href: "/stores" },
    { label: "قوانین و مقررات", href: "/faq" },
  ];

  return (
    <>
      {/* Scalloped cloud transition into the footer */}
      <div className="scallop-divider mt-section-gap" aria-hidden />

      <footer className="rounded-t-lg border-t border-outline-variant bg-surface-container-low">
        <div className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-gutter md:py-section-gap">
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-4">
            {/* Brand column */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 group">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                  <Cloud className="size-5" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-headline-sm text-headline-sm font-black text-primary">{business.name}</span>
                  <span className="text-[10px] font-semibold tracking-widest text-on-surface-variant">جهان کودک</span>
                </span>
              </Link>
              <p className="mt-4 max-w-md text-body-md font-body-md leading-8 text-on-surface-variant">
                تولیدکنندهٔ اختصاصی سرویس خواب نوزاد و ارائه‌دهندهٔ برترین برندهای جهانی سیسمونی؛
                با بیش از ۱۵ سال تجربه در خدمت خانواده‌های ایرانی. کیفیت را در جزئیات بچشید.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  href={business.instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors hover:bg-primary hover:text-on-primary"
                  aria-label="اینستاگرام"
                >
                  <Instagram className="size-4" />
                </a>
                <a
                  href={business.phoneHref}
                  className="flex size-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors hover:bg-primary hover:text-on-primary"
                  aria-label="تماس"
                >
                  <Phone className="size-4" />
                </a>
                <a
                  href={`mailto:${business.supportEmail}`}
                  className="flex size-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors hover:bg-primary hover:text-on-primary"
                  aria-label="ایمیل"
                >
                  <Mail className="size-4" />
                </a>
              </div>

              {/* Contact mini rows */}
              <ul className="mt-6 space-y-2.5 text-[13px] text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-primary" />
                  {business.addressLine}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-primary" />
                  <span dir="ltr">{toFaDigits(business.phoneDisplay)}</span>
                </li>
              </ul>
            </div>

            {/* Quick access */}
            <div>
              <h3 className="font-label-md text-label-md mb-4 font-bold text-on-surface">دسترسی سریع</h3>
              <ul className="space-y-2.5 font-label-md text-label-md">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href as any} className="text-on-surface-variant transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services + categories */}
            <div>
              <h3 className="font-label-md text-label-md mb-4 font-bold text-on-surface">خدمات مشتریان</h3>
              <ul className="space-y-2.5 font-label-md text-label-md">
                {serviceLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href as any} className="text-on-surface-variant transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {categories.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {categories.slice(0, 4).map((cat) => (
                    <Link
                      key={cat.slug}
                      to="/category/$slug"
                      params={{ slug: cat.slug }}
                      className="rounded-full bg-surface-container-high px-3 py-1 text-[11px] font-semibold text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary"
                    >
                      {cat.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Newsletter + trust row */}
          <div className="mt-12 grid gap-gutter border-t border-outline-variant pt-gutter lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="font-label-md text-label-md flex items-center gap-2 font-bold text-on-surface">
                <Sparkles className="size-4 text-primary" />
                عضویت در خبرنامه
              </h3>
              <p className="mt-2 text-[13px] text-on-surface-variant">از جدیدترین محصولات و تخفیف‌ها زودتر از همه باخبر شوید.</p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!email.trim()) return;
                  onSubscribe?.(email.trim());
                  setEmail("");
                }}
                className="relative mt-4 max-w-md"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="آدرس ایمیل شما"
                  dir="ltr"
                  className="h-12 w-full rounded-full border-2 border-outline-variant bg-surface-container-lowest pl-20 pr-5 text-sm outline-none transition-colors focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="absolute left-1 top-1 flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-[13px] font-bold text-on-primary shadow-md shadow-primary/25 transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
                >
                  <Send className="size-3.5" />
                  ثبت
                </button>
              </form>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:justify-items-end">
              {[
                { label: "ضمانت اصالت", icon: ShieldCheck },
                { label: "بازگشت ۷ روزه", icon: Cloud },
                { label: "پرداخت امن", icon: ShieldCheck },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-3 text-center"
                >
                  <badge.icon className="size-5 text-primary" />
                  <span className="text-[10px] font-bold text-on-surface">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright bar */}
          <div className="mt-gutter border-t border-outline-variant pt-4 text-center text-[12px] text-on-surface-variant">
            © {toFaDigits(new Date().getFullYear())} {business.name}. تمامی حقوق محفوظ است.
          </div>
        </div>
      </footer>
    </>
  );
}
