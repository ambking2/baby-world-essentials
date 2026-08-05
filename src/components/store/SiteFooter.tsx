import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone, Send, Facebook, Twitter, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { business } from "@/data/business";
import { toFaDigits } from "@/lib/format";
import type { Category } from "@/server/repo/catalog";

type SiteFooterProps = {
  categories: Array<Category>;
  onSubscribe?: (email: string) => void;
  subscribing?: boolean;
};

export function SiteFooter({ onSubscribe, subscribing = false }: SiteFooterProps) {
  const [email, setEmail] = useState("");

  const footerGroups = [
    {
      title: "درباره ما",
      links: [
        { label: "داستان جهان کودک", href: "/about" },
        { label: "کارگاه اختصاصی", href: "/about" },
        { label: "مجله آموزشی", href: "/blog" },
        { label: "تماس با ما", href: "/contact" },
      ],
    },
    {
      title: "دسته‌بندی‌ها",
      links: [
        { label: "سرویس خواب نوزاد", href: "/category/servis-khab" },
        { label: "پوشاک ارگانیک", href: "/category/lebas" },
        { label: "لوازم حمل و نقل", href: "/category/kalaskeh" },
        { label: "اسباب‌بازی آموزشی", href: "/category/asbab-bazi" },
      ],
    },
    {
      title: "خدمات مشتریان",
      links: [
        { label: "سوالات متداول", href: "/faq" },
        { label: "پیگیری سفارش", href: "/account/orders" },
        { label: "قوانین و مقررات", href: "/faq" },
        { label: "حریم خصوصی", href: "/faq" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-white pt-16 lg:pt-24">
      <div className="container-page">
        {/* Newsletter & Brand Intro */}
        <div className="mb-16 grid gap-16 lg:grid-cols-[1fr_450px]">
          <div className="max-w-xl">
            <Link to="/">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 lg:text-2xl">{business.name}</h2>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              تولیدکننده اختصاصی سرویس خواب نوزاد و ارائه‌دهنده برترین برندهای جهانی سیسمونی با بیش از ۱۵ سال تجربه در خدمت خانواده‌های ایرانی. ما معتقدیم کیفیت در جزئیات است.
            </p>
            <div className="mt-8 flex gap-5">
              <a href="#" className="flex size-9 items-center justify-center rounded-full border border-border text-gray-400 transition-all hover:border-gray-900 hover:text-gray-900"><Instagram className="size-4" /></a>
              <a href="#" className="flex size-9 items-center justify-center rounded-full border border-border text-gray-400 transition-all hover:border-gray-900 hover:text-gray-900"><Facebook className="size-4" /></a>
              <a href="#" className="flex size-9 items-center justify-center rounded-full border border-border text-gray-400 transition-all hover:border-gray-900 hover:text-gray-900"><Twitter className="size-4" /></a>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-gray-50 p-8 lg:p-10">
            <h3 className="mb-2 text-base font-bold text-gray-900">به خبرنامه ما بپیوندید</h3>
            <p className="mb-6 text-[13px] text-gray-500">از جدیدترین محصولات و تخفیف‌های ویژه ما زودتر از بقیه باخبر شوید.</p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!email.trim()) return;
                onSubscribe?.(email.trim());
                setEmail("");
              }}
              className="relative flex items-center"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="آدرس ایمیل شما"
                className="w-full rounded-sm border border-border bg-white px-6 py-4 text-sm outline-none transition-all focus:border-gray-900 pr-12"
                dir="ltr"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="absolute left-1.5 flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Send className="size-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">
                {group.title}
              </h3>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href as any} className="text-[13px] text-gray-500 transition-colors hover:text-gray-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">ارتباط با ما</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-[13px] leading-relaxed text-gray-500">{business.addressLine}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-primary" />
                <span className="text-[13px] text-gray-500" dir="ltr">{toFaDigits(business.phoneDisplay)}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-primary" />
                <span className="text-[13px] text-gray-500">{business.supportEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 border-t border-border py-10">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-1.5 grayscale transition-all hover:grayscale-0">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-[9px] font-bold text-gray-900 uppercase tracking-widest">عضو رسمی اتحادیه</span>
              </div>
              <div className="h-6 w-10 bg-muted/40 rounded grayscale" />
              <div className="h-6 w-10 bg-muted/40 rounded grayscale" />
            </div>

            <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
              © {toFaDigits(new Date().getFullYear())} {business.name}. تمامی حقوق محفوظ است.
            </p>

            <div className="flex gap-6 grayscale opacity-60">
              <div className="h-5 w-8 bg-muted rounded" />
              <div className="h-5 w-8 bg-muted rounded" />
              <div className="h-5 w-8 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
