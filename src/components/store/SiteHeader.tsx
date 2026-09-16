import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronLeft,
  Home,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ExpandingSearchDock } from "@/components/ui/expanding-search-dock";

import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@/server/repo/catalog";

type SiteHeaderProps = {
  categories: Array<Category>;
  cartCount: number;
  cartTotal: number;
  userName: string | null;
  userRole?: string | null | undefined;
  isAdmin?: boolean;
  announcement?: string | null;
};

const NAV_LINKS = [
  { label: "خانه", to: "/" },
  { label: "دسته‌بندی‌ها", to: "/categories" },
  { label: "فروشگاه", to: "/shop" },
  { label: "تخفیف‌ها", to: "/offers" },
  { label: "برندها", to: "/brands" },
  { label: "مجله", to: "/blog" },
] as const;

export function SiteHeader({
  categories,
  cartCount,
  cartTotal,
  userName,
  userRole,
}: SiteHeaderProps) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    setMobileOpen(false);
    void navigate({ to: "/search", search: { q: term.trim() } });
  };

  const dockSearch = (query: string) => {
    if (!query.trim()) return;
    setMobileOpen(false);
    void navigate({ to: "/search", search: { q: query.trim() } });
  };

  return (
    <header className="relative w-full">
      {/* Announcement bar — برنز MOOD. */}
      <div className="bg-primary py-2.5 px-4 text-center text-[11px] font-medium tracking-wide text-white">
        ارسال رایگان سفارش‌های بالای {formatToman(business.freeShippingThreshold)}
        <span className="mx-2 opacity-60">·</span>
        پشتیبانی {toFaDigits(business.phoneDisplay)}
        <span className="mx-2 opacity-60">·</span>
        <Link
          to="/offers"
          className="underline underline-offset-4 transition-colors duration-300 hover:text-white/80"
        >
          تازه‌ترین کالاهای کارگاه
        </Link>
      </div>

      {/* Sticky nav — blur سفید + حاشیهٔ باریک، لوگو کاملاً وسط */}
      <div className="sticky top-0 z-40 w-full border-b border-zinc-100 bg-white/95 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-container-max items-center justify-between px-margin-mobile md:h-20 md:px-gutter">
          {/* Right side (RTL start): hamburger mobile / nav desktop */}
          <div className="flex items-center gap-6">
            <button
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors duration-300 hover:bg-muted lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="باز کردن منو"
            >
              <Menu className="size-5" />
            </button>

            <nav className="hidden items-center gap-6 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[13px] font-medium text-zinc-600 transition-colors duration-300 hover:text-primary data-[status=active]:font-semibold data-[status=active]:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Logo — absolute center */}
          <Link
            to="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            aria-label={business.name}
          >
            <span className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-sm md:size-10">
                <Sparkles className="size-4 md:size-5" />
              </span>
              <span className="font-serif text-xl font-bold tracking-tight text-foreground md:text-2xl">
                جهان کودک<span className="text-primary">.</span>
              </span>
            </span>
          </Link>

          {/* Left side (RTL end): search + wishlist + bag + account */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <div className="sm:hidden">
              <ExpandingSearchDock onSearch={dockSearch} placeholder="جستجو…" />
            </div>

            <div className="hidden xl:block">
              <ExpandingSearchDock onSearch={dockSearch} placeholder="جستجوی محصول…" />
            </div>

            <button
              type="button"
              onClick={() => {
                if (!term.trim()) {
                  void navigate({ to: "/search", search: { q: "" } });
                }
              }}
              className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors duration-300 hover:text-primary lg:hidden"
              aria-label="جستجو"
            >
              <Search className="size-5" />
            </button>

            <Link
              to="/account/wishlist"
              className="hidden size-10 items-center justify-center rounded-full text-foreground transition-colors duration-300 hover:text-primary sm:flex"
              aria-label="علاقه‌مندی‌ها"
            >
              <Heart className="size-5" />
            </Link>

            <Link
              to="/cart"
              className="relative flex size-10 items-center justify-center rounded-full text-foreground transition-colors duration-300 hover:text-primary"
              aria-label="سبد خرید"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {toFaDigits(cartCount)}
                </span>
              )}
            </Link>

            <Link
              to={userName ? "/account" : "/auth/login"}
              className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors duration-300 hover:text-primary"
              aria-label={userName ? "حساب من" : "ورود"}
            >
              <User className="size-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-[100] lg:hidden", mobileOpen ? "visible" : "invisible")}>
        <div
          className={cn(
            "absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-[85%] max-w-[340px] flex-col rounded-l-xl bg-white shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-zinc-100 p-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-white">
                <Sparkles className="size-5" />
              </span>
              <span className="font-serif text-lg font-bold text-foreground">
                {business.name}
                <span className="text-primary">.</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-90"
              aria-label="بستن منو"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 pb-6 hide-scrollbar">
            <p className="mb-2 px-2 text-[11px] font-bold tracking-wide text-zinc-400">منوی اصلی</p>
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-muted hover:text-primary"
                  >
                    <span>{link.label}</span>
                    <ChevronLeft className="size-4 opacity-40" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mb-2 mt-6 px-2 text-[11px] font-bold tracking-wide text-zinc-400">
              دسته‌بندی‌ها
            </p>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: cat.slug }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-lg px-4 py-2.5 text-[13px] font-medium text-zinc-600 transition-colors duration-300 hover:bg-muted hover:text-primary"
                  >
                    <span>{cat.title}</span>
                    <span className="text-[11px] opacity-60">{toFaDigits(cat.productCount)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-zinc-100 bg-muted/50 p-4">
            {userName ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-white">
                    <User className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{userName}</p>
                    <p className="text-[10px] text-zinc-500">
                      {userRole === "admin" ? "مدیر سیستم" : "مشتری"}
                    </p>
                  </div>
                </div>
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-charcoal px-4 py-2 text-[11px] font-bold text-white transition-colors duration-300 hover:bg-primary"
                >
                  پنل کاربری
                </Link>
              </div>
            ) : (
              <Link
                to="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-charcoal py-3 text-sm font-bold text-white transition-colors duration-300 hover:bg-primary"
              >
                <User className="size-4" />
                ورود / ثبت‌نام
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/** نوار تب پایین موبایل */
export function MobileBottomNav() {
  const tabs = [
    { to: "/", label: "خانه", icon: Home, exact: true },
    { to: "/categories", label: "دسته‌ها", icon: LayoutGrid, exact: false },
    { to: "/cart", label: "سبد", icon: ShoppingCart, exact: false },
    { to: "/account/wishlist", label: "علاقه‌مندی", icon: Heart, exact: false },
    { to: "/account", label: "حساب", icon: User, exact: false },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-zinc-100 bg-white/95 backdrop-blur-lg shadow-[0_-4px_24px_rgba(164,143,127,0.12)] lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.exact }}
            className="flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-medium text-zinc-500 transition-all duration-300 data-[status=active]:text-primary"
          >
            <tab.icon className="size-5" />
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
