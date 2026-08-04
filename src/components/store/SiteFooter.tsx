import { Link } from "@tanstack/react-router";
import { Clock, Instagram, Mail, MapPin, Phone, Send } from "lucide-react";
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

/** فوتر فروشگاه با دسته‌بندی‌ها، خبرنامه و اطلاعات تماس. */
export function SiteFooter({ categories, onSubscribe, subscribing = false }: SiteFooterProps) {
  const [email, setEmail] = useState("");
  const instagramUrl = "https://instagram.com/" + business.instagramHandle;

  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="container-page grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-2xl bg-brand text-lg font-black text-primary-foreground">ج</span>
            <span className="text-sm font-extrabold text-foreground">{business.name}</span>
          </div>
          <p className="text-xs leading-6 text-muted-foreground">{business.tagline}</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {business.addressLine}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand" aria-hidden />
              <a href={business.phoneHref} className="transition-colors hover:text-brand">
                {toFaDigits(business.phoneDisplay)}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-brand" aria-hidden />
              <a href={`mailto:${business.supportEmail}`} className="transition-colors hover:text-brand">
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
          <h2 className="mb-3 text-sm font-extrabold text-foreground">دسته‌بندی محصولات</h2>
          <ul className="space-y-2">
            {categories.slice(0, 7).map((category) => (
              <li key={category.id}>
                <Link
                  to="/category/$slug"
                  params={{ slug: category.slug }}
                  className="text-xs text-muted-foreground transition-colors hover:text-brand"
                >
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-extrabold text-foreground">خدمات مشتریان</h2>
          <ul className="space-y-2">
            {HELP_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.href} className="text-xs text-muted-foreground transition-colors hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-foreground">خبرنامهٔ تخفیف‌ها</h2>
          <p className="text-xs leading-6 text-muted-foreground">
            ایمیلتان را بنویسید تا از حراج‌ها و محصولات تازهٔ کارگاه زودتر باخبر شوید.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (email.trim().length === 0) return;
              onSubscribe?.(email.trim());
              setEmail("");
            }}
            className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1.5"
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@mail.com"
              className="w-full bg-transparent px-2 text-xs outline-none"
              aria-label="ایمیل خبرنامه"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-primary-foreground disabled:opacity-60"
              aria-label="عضویت در خبرنامه"
            >
              <Send className="size-4" aria-hidden />
            </button>
          </form>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-brand hover:text-brand"
          >
            <Instagram className="size-4" aria-hidden />
            {business.instagramHandle}
          </a>
        </div>
      </div>

      <div className="border-t border-border py-4">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <p>
            تمامی حقوق این وب‌سایت برای {business.name} محفوظ است — {toFaDigits(business.currentJalali)}
          </p>
          <p>طراحی و توسعه با تمرکز بر سرعت و تجربهٔ خرید روان</p>
        </div>
      </div>
    </footer>
  );
}
