import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, Clock, Instagram, Mail, MapPin, Phone, Send, Sparkles } from "lucide-react";
import { useState } from "react";

import { business } from "@/data/business";
import { toFaDigits } from "@/lib/format";
import type { Category } from "@/server/repo/catalog";

type SiteFooterProps = {
  categories: Array<Category>;
  onSubscribe?: (email: string) => void;
  subscribing?: boolean;
};

const HELP_LINKS: Array<{ label: string; href: string }> = [
  { label: "روش خرید و پرداخت", href: "/faq" },
  { label: "شرایط مردودی کالا", href: "/faq" },
  { label: "رهگیری سفارش", href: "/account/orders" },
  { label: "تماس با ما", href: "/contact" },
  { label: "دربارهٔ جهان کودک", href: "/about" },
  { label: "مجلهٔ مادر و کودک", href: "/blog" },
];

export function SiteFooter({ categories, onSubscribe, subscribing = false }: SiteFooterProps) {
  const [email, setEmail] = useState("");
  const instagramUrl = "https://instagram.com/" + business.instagramHandle;

  return (
    <footer className="relative mt-24 bg-charcoal text-white">
      <div className="cloud-top -translate-y-8" />
      <div className="container-page relative grid gap-8 pb-8 pt-20 md:grid-cols-2 lg:grid-cols-[1.1fr_.8fr_.8fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="toy-button relative grid size-14 place-items-center rounded-[1.65rem] bg-gradient-to-br from-brand to-sale text-2xl font-black text-white">
              ج
              <span className="absolute -bottom-2 rounded-full bg-white px-2 py-0.5 text-[8px] font-black text-brand">kids</span>
            </span>
            <div>
              <p className="text-lg font-extrabold">{business.name}</p>
              <p className="text-xs text-white/65">{business.tagline}</p>
            </div>
          </div>

          <p className="max-w-sm text-xs leading-7 text-white/72">
            فروشگاه و کارگاه جهان کودک با تمرکز روی سیسمونی کاربردی، اتاق نوزاد و پوشاک نرم و ایمن؛ با پشتیبانی واقعی و تجربهٔ خرید انسانی.
          </p>

          <ul className="space-y-2 text-xs text-white/72">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {business.addressLine}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand" aria-hidden />
              <a href={business.phoneHref} className="transition-colors hover:text-white">
                {toFaDigits(business.phoneDisplay)}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-brand" aria-hidden />
              <a href={`mailto:${business.supportEmail}`} className="transition-colors hover:text-white" dir="ltr">
                {business.supportEmail}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-brand" aria-hidden />
              {business.hoursFull}
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-extrabold text-white">دسته‌بندی‌های محبوب</h2>
          <ul className="space-y-3">
            {categories.slice(0, 7).map((category) => (
              <li key={category.id}>
                <Link
                  to="/category/$slug"
                  params={{ slug: category.slug }}
                  className="inline-flex items-center gap-2 text-xs text-white/72 transition-colors hover:text-white"
                >
                  <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-extrabold text-white">خدمات مشتریان</h2>
          <ul className="space-y-3">
            {HELP_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.href} className="inline-flex items-center gap-2 text-xs text-white/72 transition-colors hover:text-white">
                  <ArrowUpLeft className="size-3.5 text-brand" aria-hidden />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="section-shell bg-white/8 p-5 text-foreground">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-extrabold text-brand">
            <Sparkles className="size-3.5" aria-hidden />
            خبرنامهٔ تخفیف‌ها
          </div>
          <h2 className="text-base font-extrabold text-white">از پیشنهادهای واقعی جا نمانید</h2>
          <p className="mt-2 text-xs leading-6 text-white/70">
            ایمیلتان را بگذارید تا از حراج‌ها، موجود شدن کالاها و محصولات تازهٔ کارگاه زودتر باخبر شوید.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (email.trim().length === 0) return;
              onSubscribe?.(email.trim());
              setEmail("");
            }}
            className="mt-4 flex items-center gap-2 rounded-full border border-white/12 bg-white/6 p-1.5"
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@mail.com"
              className="w-full bg-transparent px-3 text-xs text-white outline-none placeholder:text-white/40"
              aria-label="ایمیل خبرنامه"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="toy-button inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-primary-foreground disabled:opacity-60"
              aria-label="عضویت در خبرنامه"
            >
              <Send className="size-4" aria-hidden />
            </button>
          </form>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-brand hover:bg-white/10"
          >
            <Instagram className="size-4 text-brand" aria-hidden />
            @{business.instagramHandle}
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/55">
          <p>تمامی حقوق این وب‌سایت برای {business.name} محفوظ است — {toFaDigits(business.currentJalali)}</p>
          <p>طراحی تازه با تجربه‌ای گرم‌تر، انسانی‌تر و شبیه فروشگاه‌های واقعی</p>
        </div>
      </div>
    </footer>
  );
}
