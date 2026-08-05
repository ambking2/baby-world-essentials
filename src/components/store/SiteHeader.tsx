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
  Sparkles,
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
  { label: "خانه", href: "/" },
  { label: "فروشگاه", href: "/search" },
  { label: "تخفیف‌ها", href: "/offers" },
  { label: "مجلهٔ مادر و کودک", href: "/blog" },
  { label: "دربارهٔ ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

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
    <header className="sticky top-0 z-50 pb-3 pt-3">
      <div className="container-page space-y-3">
        <div className="hidden items-center justify-between rounded-full border border-white/70 bg-background/80 px-4 py-2 text-[11px] text-muted-foreground shadow-soft backdrop-blur md:flex">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
              <Sparkles className="size-3.5 text-brand" aria-hidden />
              {announcement ?? `ارسال رایگان برای خرید بالای ${formatToman(business.freeShippingThreshold)}`}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-[10px] text-muted-foreground/0 group-hover/header:text-muted-foreground">ارور میده بررسی کن ببین مشکل چیه</span>
            <a href={business.phoneHref} className="inline-flex items-center gap-1.5 font-bold text-foreground transition-colors hover:text-brand">
              <Phone className="size-3.5 text-brand" aria-hidden />
              {toFaDigits(business.phoneDisplay)}
            </a>
          </div>
        </div>

        <div className={cn("glass-panel group/header rounded-[2.8rem] border-white/90 px-3 py-3 shadow-lift backdrop-blur-xl transition-all duration-500", scrolled && "mx-auto max-w-[96%] translate-y-2 border-brand/10 shadow-deep")}>
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-foreground lg:hidden"
              aria-label="منو"
            >
              <Menu className="size-5" aria-hidden />
            </button>

            <Link to="/" className="flex shrink-0 items-center gap-3">
              <span className="toy-button relative grid size-16 place-items-center rounded-[2rem] bg-gradient-to-br from-brand to-sale text-3xl font-black text-white shadow-lift">
                ج
                <span className="absolute -bottom-2 start-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-brand shadow-soft">
                  kids
                </span>
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-base font-extrabold text-foreground">{business.shortName}</span>
                <span className="block text-[11px] text-muted-foreground">سیسمونی، پوشاک و دکور اتاق کودک</span>
              </span>
            </Link>

            <div ref={searchRef} className="relative flex-1">
              <form
                onSubmit={submitSearch}
                className="flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-4 py-2.5 shadow-inner transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/5"
              >
                <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  value={term}
                  onChange={(event) => {
                    setTerm(event.target.value);
                    setShowSuggest(true);
                    onSearchTermChange?.(event.target.value);
                  }}
                  onFocus={() => setShowSuggest(true)}
                  placeholder="مثلاً: تخت نوزاد، سرهمی، کالسکه"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  aria-label="جستجوی محصول"
                />
                {term.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTerm("");
                      setShowSuggest(false);
                    }}
                    aria-label="پاک کردن"
                  >
                    <X className="size-4 text-muted-foreground" aria-hidden />
                  </button>
                ) : null}
              </form>

              {showSuggest && suggestions.length > 0 ? (
                <div className="pop-in absolute inset-x-0 top-[calc(100%+10px)] overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/95 shadow-lift">
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      onClick={() => setShowSuggest(false)}
                      className="flex items-center gap-3 border-b border-border/60 p-3 last:border-0 hover:bg-brand-soft/30"
                    >
                      <img src={item.cover ?? "/images/cat-toys.jpg"} alt="" className="size-12 rounded-2xl object-cover" />
                      <span className="flex-1 text-xs font-semibold text-foreground">{item.title}</span>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-foreground">
                        {formatToman(item.effectivePrice)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={userName ? "/account" : "/auth/login"}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 text-xs font-bold text-foreground transition-colors hover:border-brand hover:text-brand"
              >
                {userName ? <User className="size-4" aria-hidden /> : <LogIn className="size-4" aria-hidden />}
                <span className="hidden lg:inline">{userName ?? "ورود | عضویت"}</span>
              </Link>

              <Link
                to="/account/wishlist"
                className="hidden size-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-foreground transition-colors hover:border-brand hover:text-brand sm:inline-flex"
                aria-label="علاقه‌مندی‌ها"
              >
                <Heart className="size-4" aria-hidden />
              </Link>

              <Link
                to="/cart"
                className="toy-button relative inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-brand to-sale px-4 text-xs font-extrabold text-primary-foreground"
              >
                <ShoppingCart className="size-4" aria-hidden />
                <span className="hidden md:inline">{cartCount > 0 ? formatToman(cartTotal) : "سبد خرید"}</span>
                {cartCount > 0 ? (
                  <span className="pop-in absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-charcoal text-[10px] font-bold text-white">
                    {toFaDigits(cartCount)}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>

          <div className="mt-3 hidden items-center gap-2 lg:flex">
            <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-extrabold text-primary-foreground shadow-soft"
              >
                <LayoutGrid className="size-4" aria-hidden />
                دسته‌بندی‌ها
                <ChevronDown className={cn("size-4 transition-transform", megaOpen && "rotate-180")} aria-hidden />
              </button>

              {megaOpen ? (
                <div className="pop-in absolute start-0 top-[calc(100%+12px)] z-50 grid w-[780px] grid-cols-3 gap-5 rounded-[2rem] border border-white/70 bg-white/96 p-6 shadow-lift backdrop-blur">
                  {categories.map((category) => (
                    <div key={category.slug} className="rounded-[1.5rem] border border-border/70 bg-background/90 p-4">
                      <Link
                        to="/category/$slug"
                        params={{ slug: category.slug }}
                        className="text-sm font-extrabold text-foreground transition-colors hover:text-brand"
                      >
                        {category.title}
                      </Link>
                      {category.blurb ? <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{category.blurb}</p> : null}
                      <ul className="mt-3 space-y-2">
                        {category.children.map((child) => (
                          <li key={child.slug}>
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

            <div className="hide-scrollbar flex flex-1 items-center gap-1 overflow-x-auto rounded-full bg-white/75 px-2 py-1 shadow-inner backdrop-blur-sm">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-brand-soft hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {isAdmin ? (
              <Link
                to="/admin"
                className="rounded-full bg-charcoal px-4 py-2 text-xs font-extrabold text-white transition-opacity hover:opacity-90"
              >
                پنل مدیریت
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" className="absolute inset-0 bg-charcoal/55" onClick={() => setMobileOpen(false)} aria-label="بستن منو" />
          <nav className="absolute inset-y-0 end-0 flex w-[88%] max-w-sm flex-col gap-4 overflow-y-auto bg-[linear-gradient(180deg,#fff9f4_0%,#ffffff_100%)] p-5 shadow-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative grid size-12 place-items-center rounded-[1.35rem] bg-gradient-to-br from-brand to-sale text-xl font-black text-white">
                  ج
                  <span className="absolute -bottom-2 rounded-full bg-white px-2 py-0.5 text-[8px] font-black text-brand">kids</span>
                </span>
                <div>
                  <p className="text-sm font-extrabold">{business.shortName}</p>
                  <p className="text-[11px] text-muted-foreground">منوی فروشگاه</p>
                </div>
              </div>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="بستن">
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <Link
              to={userName ? "/account" : "/auth/login"}
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-3 text-sm font-extrabold text-primary-foreground"
            >
              {userName ?? "ورود و عضویت"}
            </Link>

            <div className="space-y-3">
              {categories.map((category) => (
                <details key={category.slug} className="rounded-[1.5rem] border border-border bg-white/80 p-4 shadow-soft">
                  <summary className="cursor-pointer text-sm font-bold">{category.title}</summary>
                  <ul className="mt-3 space-y-2 ps-3">
                    <li>
                      <Link
                        to="/category/$slug"
                        params={{ slug: category.slug }}
                        onClick={() => setMobileOpen(false)}
                        className="text-xs font-bold text-brand"
                      >
                        مشاهدهٔ همهٔ {category.title}
                      </Link>
                    </li>
                    {category.children.map((child) => (
                      <li key={child.slug}>
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
                  className="block rounded-2xl px-3 py-3 text-sm font-semibold text-foreground hover:bg-brand-soft/40"
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
