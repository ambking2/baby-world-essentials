import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, Phone, Send, Facebook, Twitter } from "lucide-react";
import { useState } from "react";

import { business } from "@/data/business";
import { toFaDigits } from "@/lib/format";
import type { Category } from "@/server/repo/catalog";

type SiteFooterProps = {
  categories: Array<Category>;
  onSubscribe?: (email: string) => void;
  subscribing?: boolean;
};

const FOOTER_LINKS = [
  {
    title: "خرید آنلاین",
    links: [
      { label: "سرویس خواب", href: "/category/servis-khab" },
      { label: "پوشاک نوزاد", href: "/category/lebas" },
      { label: "حمل و نقل", href: "/category/kalaskeh" },
      { label: "اسباب بازی", href: "/category/asbab-bazi" },
      { label: "تخفیف‌های ویژه", href: "/offers" },
    ],
  },
  {
    title: "خدمات مشتریان",
    links: [
      { label: "سوالات متداول", href: "/faq" },
      { label: "پیگیری سفارش", href: "/account/orders" },
      { label: "روش‌های ارسال", href: "/faq" },
      { label: "شرایط بازگشت کالا", href: "/faq" },
      { label: "راهنمای سایز", href: "/faq" },
    ],
  },
  {
    title: "شرکت ما",
    links: [
      { label: "داستان ما", href: "/about" },
      { label: "کارگاه اختصاصی", href: "/about" },
      { label: "فرصت‌های شغلی", href: "/about" },
      { label: "تماس با ما", href: "/contact" },
      { label: "مجله نوزاد", href: "/blog" },
    ],
  },
];

export function SiteFooter({ categories, onSubscribe, subscribing = false }: SiteFooterProps) {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border bg-white pt-20 lg:pt-32">
      <div className="container-page">
        {/* Newsletter Section */}
        <div className="mb-20 grid items-center gap-12 border-b border-border pb-20 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold lg:text-3xl">به خبرنامه ما بپیوندید</h2>
            <p className="text-muted-foreground lg:text-lg">
              از جدیدترین محصولات، تخفیف‌های ویژه و مقالات آموزشی ما باخبر شوید.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!email.trim()) return;
              onSubscribe?.(email.trim());
              setEmail("");
            }}
            className="flex items-center gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="آدرس ایمیل شما"
              className="flex-1 border-b border-border py-4 text-sm outline-none transition-colors focus:border-primary"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              عضویت
              <Send className="size-4" />
            </button>
          </form>
        </div>

        {/* Main Footer Links */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-8">
            <Link to="/">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{business.name}</h1>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ارائه دهنده برترین برندهای سیسمونی و تولید کننده اختصاصی سرویس خواب نوزاد با بیش از ۱۵ سال تجربه.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="size-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="size-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="size-5" /></a>
            </div>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-8 text-xs font-bold uppercase tracking-widest text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href as any} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info Row */}
        <div className="mt-20 border-t border-border py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-4">
              <MapPin className="size-5 shrink-0 text-primary" />
              <span className="text-xs text-muted-foreground">{business.addressLine}</span>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="size-5 shrink-0 text-primary" />
              <span className="text-xs text-muted-foreground" dir="ltr">{toFaDigits(business.phoneDisplay)}</span>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="size-5 shrink-0 text-primary" />
              <span className="text-xs text-muted-foreground">{business.supportEmail}</span>
            </div>
            <div className="flex items-center justify-end gap-6 lg:justify-end">
              {/* Payment Methods */}
              <div className="h-6 w-10 bg-secondary rounded" />
              <div className="h-6 w-10 bg-secondary rounded" />
              <div className="h-6 w-10 bg-secondary rounded" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-8 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            © {toFaDigits(new Date().getFullYear())} {business.name}. تمامی حقوق محفوظ است. طراحی شده برای بهترین شروع زندگی.
          </p>
        </div>
      </div>
    </footer>
  );
}
