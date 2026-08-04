import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Clock,
  Heart,
  LayoutGrid,
  LogIn,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { business } from "@/data/business";
import { useScrolled } from "@/hooks/use-reveal";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@/server/repo/catalog";

export type HeaderSuggestion = {
  id: number;
  slug: string;
  title: string;
  cover: string | null;
  effectivePrice: number;
};

type SiteHeaderProps = {
  categories: Array<Category>;
  cartCount: number;
  cartTotal: number;
  userName: string | null;
  isAdmin?: boolean;
  announcement?: string | null;
  suggestions?: Array<HeaderSuggestion>;
  onSearchTermChange?: (term: string) => void;
};

const QUICK_LINKS: Array<{ label: string; href: string }> = [
  { label: "فروشگاه", href: "/search" },
  { label: "تخفیف‌ها", href: "/offers" },
  { label: "مجلهٔ مادر و کودک", href: "/blog" },
  { label: "دربارهٔ ما", href: "/about" },
  { label: "تماس و نشانی", href: "/contact" },
  { label: "سوالات متداول", href: "/faq" },
];

/** هدر اصلی فروشگاه: نوار بالا، جستجوی زنده، مگامنو و سبد خرید. */
export function SiteHeader({
  categories,
  cartCount,
  cartTotal,
  userName,
  isAdmin = false,
  announcement,
  suggestions = [],
  onSearchTermChange,
}: SiteHeaderProps) {
  const navigate = useNavigate();
  const scrolled = useScrolled(60);
  const [term, setTerm] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setShowSuggest(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = term.trim();
    if (query.length === 0) return;
    setShowSuggest(false);
    void navigate({ to: "/search", search: { q: query } });
  };

  return (
    <header className="sticky top-0 z-50">
      {/* نوار اطلاع‌رسانی */}
      <div className="bg-charcoal text-white">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[12px]">
          <p className="line-clamp-1">{announcement ?? `ارسال رایگان برای خرید بالای ${formatToman(business.freeShippingThreshold)}`}</p>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="flex items-center gap-1 opacity-90">
              <Clock className="size-3.5" aria-hidden />
              {business.hoursShort}
            </span>
            <a href={business.phoneHref} className="flex items-center gap-1 font-semibold transition-opacity hover:opacity-80">
              <Phone className="size-3.5" aria-hidden />
              {toFaDigits(business.phoneDisplay)}
            </a>
          </div>
        </div>
      </div>

      {/* نوار اصلی */}
      <div className={cn("border-b border-border bg-background/95 backdrop-blur transition-shadow", scrolled && "shadow-soft")}>
        <div className="container-page flex h-16 items-center gap-3 md:h-20 md:gap-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border lg:hidden"
            aria-label="منو"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid size-10 place-items-center rounded-2xl bg-brand text-lg font-black text-primary-foreground">ج</span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-extrabold text-foreground">{business.shortName}</span>
              <span className="block text-[11px] text-muted-foreground">سیسمونی و لوازم نوزاد</span>
            </span>
          </Link>

          {/* جستجو */}
          <div ref={searchRef} className="relative flex-1">
            <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/50 px-3 py-2 focus-within:border-brand">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                value={term}
                onChange={(event) => {
                  setTerm(event.target.value);
                  setShowSuggest(true);
                  onSearchTermChange?.(event.target.value);
                }}
                onFocus={() => setShowSuggest(true)}
                placeholder="دنبال چه محصولی هستید؟ مثلاً تخت نوزاد"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="جستجوی محصول"
              />
              {term.length > 0 ? (
                <button type="button" onClick={() => setTerm("")} aria-label="پاک کردن">
                  <X className="size-4 text-muted-foreground" aria-hidden />
                </button>
              ) : null}
            </form>

            {showSuggest && suggestions.length > 0 ? (
              <div className="pop-in absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    to="/product/$slug"
                    params={{ slug: item.slug }}
                    onClick={() => setShowSuggest(false)}
                    className="flex items-center gap-3 border-b border-border/60 p-2.5 last:border-0 hover:bg-secondary/60"
                  >
                    <img src={item.cover ?? "/images/cat-toys.jpg"} alt="" className="size-11 rounded-xl object-cover" />
                    <span className="flex-1 text-xs font-semibold text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{formatToman(item.effectivePrice)}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {/* اکشن‌ها */}
          <div className="flex items-center gap-1.5">
            <Link
              to={userName ? "/account" : "/auth/login"}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold transition-colors hover:border-brand hover:text-brand"
            >
              {userName ? <User className="size-4" aria-hidden /> : <LogIn className="size-4" aria-hidden />}
              <span className="hidden sm:inline">{userName ?? "ورود | عضویت"}</span>
            </Link>

            <Link
              to="/account/wishlist"
              className="hidden size-10 items-center justify-center rounded-xl border border-border transition-colors hover:border-brand hover:text-brand sm:inline-flex"
              aria-label="علاقه‌مندی‌ها"
            >
              <Heart className="size-4" aria-hidden />
            </Link>

            <Link
              to="/cart"
              className="relative inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-3 text-xs font-bold text-primary-foreground"
            >
              <ShoppingCart className="size-4" aria-hidden />
              <span className="hidden md:inline">{cartCount > 0 ? formatToman(cartTotal) : "سبد خرید"}</span>
              {cartCount > 0 ? (
                <span className="pop-in absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-sale text-[10px] font-bold text-white">
                  {toFaDigits(cartCount)}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      {/* نوار دسته‌بندی‌ها */}
      <div className="hidden border-b border-border bg-background lg:block">
        <div className="container-page flex h-12 items-center gap-1">
          <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <button
              type="button"
              className="inline-flex h-12 items-center gap-1.5 rounded-t-xl px-3 text-sm font-bold text-brand"
            >
              <LayoutGrid className="size-4" aria-hidden />
              دسته‌بندی محصولات
              <ChevronDown className={cn("size-4 transition-transform", megaOpen && "rotate-180")} aria-hidden />
            </button>

            {megaOpen ? (
              <div className="pop-in absolute start-0 top-full z-50 grid w-[720px] grid-cols-3 gap-5 rounded-b-3xl border border-border bg-card p-6 shadow-lift">
                {categories.map((category) => (
                  <div key={category.id}>
                    <Link
                      to="/category/$slug"
                      params={{ slug: category.slug }}
                      className="text-sm font-extrabold text-foreground transition-colors hover:text-brand"
                    >
                      {category.title}
                    </Link>
                    <ul className="mt-2 space-y-1.5">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            to="/category/$slug"
                            params={{ slug: child.slug }}
                            className="text-xs text-muted-foreground transition-colors hover:text-brand"
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <span className="mx-2 h-5 w-px bg-border" aria-hidden />

          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary hover:text-brand"
            >
              {link.label}
            </Link>
          ))}

          {isAdmin ? (
            <Link to="/admin" className="ms-auto rounded-xl bg-installment px-3 py-1.5 text-xs font-bold text-installment-foreground">
              پنل مدیریت
            </Link>
          ) : null}
        </div>
      </div>

      {/* منوی موبایل */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" className="absolute inset-0 bg-charcoal/50" onClick={() => setMobileOpen(false)} aria-label="بستن منو" />
          <nav className="absolute inset-y-0 end-0 flex w-[86%] max-w-sm flex-col gap-4 overflow-y-auto bg-background p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold">منوی فروشگاه</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="بستن">
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((category) => (
                <details key={category.id} className="rounded-2xl border border-border p-3">
                  <summary className="cursor-pointer text-sm font-bold">{category.title}</summary>
                  <ul className="mt-2 space-y-2 ps-3">
                    <li>
                      <Link
                        to="/category/$slug"
                        params={{ slug: category.slug }}
                        onClick={() => setMobileOpen(false)}
                        className="text-xs text-brand"
                      >
                        مشاهدهٔ همهٔ {category.title}
                      </Link>
                    </li>
                    {category.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          to="/category/$slug"
                          params={{ slug: child.slug }}
                          onClick={() => setMobileOpen(false)}
                          className="text-xs text-muted-foreground"
                        >
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>

            <div className="space-y-1 border-t border-border pt-3">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-2 py-2 text-sm text-foreground hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
