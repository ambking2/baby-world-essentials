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
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ExpandingSearchDock } from "@/components/ui/expanding-search-dock";

const brandLogoUrl = "/assets/logo/brand-logo.png";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      {/* Announcement bar */}
      <div className="bg-primary py-2 px-4 text-center text-[11px] font-semibold text-on-primary rounded-b-lg">
        ✦ ضمانت اصالت کالا · ارسال رایگان سفارش‌های بالای{" "}
        {formatToman(business.freeShippingThreshold)} · پشتیبانی {toFaDigits(business.phoneDisplay)}
      </div>

      {/* Sticky frosted main bar (design system: h-20, backdrop-blur, surface-container-lowest) */}
      <div
        className={cn(
          "sticky top-0 z-50 w-full bg-surface-container-lowest/80 backdrop-blur-md transition-shadow duration-300",
          isScrolled ? "shadow-md" : "shadow-sm",
        )}
      >
        <div className="mx-auto flex h-20 max-w-container-max items-center justify-between gap-4 px-margin-mobile md:px-gutter">
          {/* Mobile menu */}
          <button
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary transition-transform hover:bg-primary-fixed active:scale-95 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="باز کردن منو"
          >
            <Menu className="size-6" />
          </button>

          {/* Brand */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5 group">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Sparkles className="size-5" />
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-headline-sm text-headline-sm font-black text-primary">
                {business.name}
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-on-surface-variant">
                جهان کودک
              </span>
            </span>
          </Link>

          {/* Desktop nav — underline-active links */}
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="border-b-2 border-transparent pb-1 text-label-md font-label-md text-on-surface-variant transition-colors duration-300 hover:border-primary hover:text-primary data-[status=active]:border-primary data-[status=active]:font-bold data-[status=active]:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop expanding search dock */}
          <div className="hidden xl:block">
            <ExpandingSearchDock onSearch={dockSearch} placeholder="جستجوی محصول…" />
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/account/wishlist"
              className="hidden size-10 items-center justify-center rounded-full bg-surface-container-low text-primary transition-all hover:bg-primary-fixed active:scale-95 sm:flex"
              aria-label="علاقه‌مندی‌ها"
            >
              <Heart className="size-5" />
            </Link>
            <Link
              to="/cart"
              className="relative flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-primary transition-all hover:bg-primary-fixed active:scale-95"
              aria-label="سبد خرید"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-on-secondary ring-2 ring-surface-container-lowest">
                  {toFaDigits(cartCount)}
                </span>
              )}
              <span className="hidden text-[11px] font-bold xl:inline">
                {cartCount > 0 ? formatToman(cartTotal) : "سبد خرید"}
              </span>
            </Link>
            <Link
              to={userName ? "/account" : "/auth/login"}
              className="flex items-center gap-2 rounded-full border border-primary/20 bg-surface-container-lowest py-1.5 pl-3 pr-1.5 transition-all hover:border-primary hover:bg-primary-fixed active:scale-95"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-fixed text-primary">
                <User className="size-4" />
              </span>
              <span className="hidden text-[11px] font-bold text-on-surface sm:inline">
                {userName ? "حساب من" : "ورود"}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-[100] lg:hidden", mobileOpen ? "visible" : "invisible")}>
        <div
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-[85%] max-w-[340px] flex-col rounded-l-xl bg-surface-container-lowest shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-outline-variant/40 p-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-on-primary">
                <Sparkles className="size-5" />
              </span>
              <span className="font-headline-sm text-headline-sm font-black text-primary">
                {business.name}
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex size-10 items-center justify-center rounded-full bg-surface-container-low text-primary active:scale-90"
              aria-label="بستن منو"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="p-4">
            <form onSubmit={submitSearch} className="relative">
              <Search className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-outline" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="جستجوی محصول…"
                className="w-full rounded-full border-[1.5px] border-outline-variant bg-surface-container-low py-2.5 pl-4 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </form>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 pb-6 hide-scrollbar">
            <p className="mb-2 px-2 text-[11px] font-bold text-on-surface-variant">منوی اصلی</p>
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-primary-fixed hover:text-primary"
                  >
                    <span>{link.label}</span>
                    <ChevronLeft className="size-4 opacity-40" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mb-2 mt-6 px-2 text-[11px] font-bold text-on-surface-variant">
              دسته‌بندی‌ها
            </p>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: cat.slug }}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-lg px-4 py-2.5 text-[13px] font-medium text-on-surface-variant transition-colors hover:bg-primary-fixed hover:text-primary"
                  >
                    <span>{cat.title}</span>
                    <span className="text-[11px] opacity-60">{toFaDigits(cat.productCount)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-outline-variant/40 bg-surface-container-low p-4">
            {userName ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-on-primary">
                    <User className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{userName}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {userRole === "admin" ? "مدیر سیستم" : "مشتری"}
                    </p>
                  </div>
                </div>
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-primary px-4 py-2 text-[11px] font-bold text-on-primary shadow-md shadow-primary/20"
                >
                  پنل کاربری
                </Link>
              </div>
            ) : (
              <Link
                to="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/25"
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

/** نوار تب پایین موبایل — مطابق الگوی اپ استیک */
export function MobileBottomNav() {
  const tabs = [
    { to: "/", label: "خانه", icon: Home, exact: true },
    { to: "/categories", label: "دسته‌ها", icon: LayoutGrid, exact: false },
    { to: "/cart", label: "سبد", icon: ShoppingCart, exact: false },
    { to: "/account/wishlist", label: "علاقه‌مندی", icon: Heart, exact: false },
    { to: "/account", label: "حساب", icon: User, exact: false },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl bg-surface-container-lowest/90 backdrop-blur-lg shadow-[0_-4px_24px_rgba(0,75,209,0.08)] lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.exact }}
            className="flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-bold text-on-surface-variant transition-all data-[status=active]:scale-105 data-[status=active]:bg-primary-fixed data-[status=active]:text-primary"
          >
            <tab.icon className="size-5" />
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
