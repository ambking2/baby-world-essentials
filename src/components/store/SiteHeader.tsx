import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

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
    void navigate({ to: "/search", search: { q: term.trim() } });
  };

  return (
    <header className="relative w-full">
      {/* Announcement Bar — gradient primary */}
      <div
        className="bg-primary py-2.5 text-center text-[9px] font-bold text-white sm:text-[10px]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%)",
        }}
      >
        🎈 ارسال رایگان برای تمام سفارش‌های بالای{" "}
        {formatToman(business.freeShippingThreshold)}
      </div>

      {/* Main Header Container — glass nav */}
      <div
        className={cn(
          "z-50 w-full transition-all duration-300",
          isScrolled
            ? "fixed top-0 shadow-premium py-2 lg:py-3 glass-nav"
            : "relative py-4 lg:py-6",
        )}
        style={
          isScrolled
            ? {
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                backgroundColor: "rgba(251, 248, 255, 0.8)",
                borderBottom: "1px solid rgba(195, 197, 216, 0.4)",
              }
            : undefined
        }
      >
        <div className="container-page flex items-center justify-between gap-6 lg:gap-12">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 -ms-2 rounded-full hover:bg-surface-container transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-6 text-gray-900" />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0 relative z-10 block group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={brandLogoUrl}
                  alt={business.name}
                  className="h-10 w-auto sm:h-12 md:h-14 transition-transform group-hover:scale-105"
                />
                <span className="absolute -top-1 -left-1 flex size-4 items-center justify-center rounded-full bg-tertiary text-white">
                  <Sparkles className="size-2.5" />
                </span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="hidden text-xl font-black text-gray-900 sm:inline sm:text-2xl">
                  {business.name}
                </span>
                <span className="hidden sm:block text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                  Jahan Koodak
                </span>
              </div>
            </div>
          </Link>

          {/* Search Bar — Desktop pill */}
          <form
            onSubmit={submitSearch}
            className="hidden max-w-xl flex-1 items-center gap-3 rounded-full border border-border bg-white px-5 py-3 shadow-soft focus-within:border-primary/40 lg:flex transition-all duration-300"
          >
            <Search className="size-4 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="جستجو در بین محصولات جهان کودک..."
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to={userName ? "/account" : "/auth/login"}
              className="hidden items-center gap-2.5 text-[13px] font-bold text-gray-900 hover:text-primary transition-colors lg:flex group"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-surface-container text-gray-900 transition-colors group-hover:bg-primary/10">
                <User className="size-4 transition-transform group-hover:scale-110" />
              </span>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] text-muted-foreground font-medium mb-1 group-hover:text-primary/70 transition-colors">
                  {userName ? "خوش آمدید" : "ورود"}
                </span>
                <span className="font-bold">{userName ?? "حساب کاربری"}</span>
              </div>
            </Link>
            <Link
              to="/account/wishlist"
              className="hidden lg:flex size-9 items-center justify-center rounded-full bg-surface-container text-gray-900 hover:text-destructive transition-colors"
            >
              <Heart className="size-4" />
            </Link>
            <Link
              to="/cart"
              className="relative flex items-center gap-2.5 text-[13px] font-bold text-gray-900 hover:text-primary transition-colors group"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-surface-container text-gray-900 transition-colors group-hover:bg-primary/10">
                <ShoppingCart className="size-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {toFaDigits(cartCount)}
                  </span>
                )}
              </span>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-[10px] text-muted-foreground font-medium mb-1 group-hover:text-primary/70 transition-colors">
                  سبد خرید
                </span>
                <span className="font-bold">
                  {cartCount > 0 ? formatToman(cartTotal) : "۰ تومان"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation — Desktop */}
      <nav
        className={cn(
          "hidden border-b border-border bg-white lg:block z-40 transition-all duration-300",
          isScrolled ? "fixed top-[61px] w-full" : "relative"
        )}
      >
        <div className="container-page flex items-center justify-between">
          <div className="flex-1 flex justify-start pr-8">
            <ul className="flex gap-8">
              <li>
                <Link
                  to="/"
                  className="relative block py-4 text-[11px] font-bold text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full active:scale-95"
                >
                  خانه
                </Link>
              </li>
              <li className="group relative">
                <button className="flex items-center gap-2 py-4 text-[11px] font-bold text-gray-900 group-hover:text-primary transition-colors">
                  دسته‌بندی‌ها
                  <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
                </button>
                {/* Mega Menu — glass card */}
                <div className="invisible absolute right-0 top-full z-[100] w-[1000px] translate-y-4 bg-white p-10 opacity-0 shadow-deep transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 rounded-b-[24px] border border-border border-t-0">
                  <div className="grid grid-cols-4 gap-10">
                    {categories.map((cat) => (
                      <div key={cat.slug} className="space-y-5">
                        <Link
                          to="/category/$slug"
                          params={{ slug: cat.slug }}
                          className="block text-[13px] font-bold text-gray-900 hover:text-primary transition-colors"
                        >
                          {cat.title}
                        </Link>
                        <ul className="space-y-3 border-r border-border/40 pr-5">
                          {cat.children.map((child) => (
                            <li key={child.slug}>
                              <Link
                                to="/category/$slug"
                                params={{ slug: child.slug }}
                                className="text-[12px] text-muted-foreground hover:text-primary hover:translate-x-[-4px] transition-all inline-block font-medium"
                              >
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="relative block py-4 text-[11px] font-bold text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  فروشگاه
                </Link>
              </li>
              <li>
                <Link
                  to="/offers"
                  className="relative block py-4 text-[11px] font-bold text-destructive hover:opacity-80 transition-colors"
                >
                  تخفیف‌های ویژه
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="relative block py-4 text-[11px] font-bold text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                >
                  مجله آموزشی
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[100] lg:hidden",
          mobileOpen ? "visible" : "invisible"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ease-in-out",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-[85%] max-w-[340px] flex-col bg-white shadow-2xl transition-all duration-500",
            mobileOpen ? "right-0" : "right-[-100%]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 p-6">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3"
            >
              <img src={brandLogoUrl} alt={business.name} className="h-10 w-auto" />
              <span className="text-lg font-bold text-gray-900">{business.name}</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex size-10 items-center justify-center rounded-full bg-muted/50 text-gray-900 transition-transform active:scale-90"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Search Area */}
          <div className="p-6">
            <form onSubmit={submitSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="جستجوی محصول..."
                className="w-full bg-[#F9F9F9] border border-border rounded-full py-3.5 pl-10 pr-4 text-[13px] outline-none focus:border-primary/30 focus:bg-white transition-all shadow-soft"
              />
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-6 pb-8 hide-scrollbar">
            <div className="space-y-8 py-4">
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground mb-4 pr-2">
                  منوی اصلی
                </span>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-all"
                    >
                      <span>خانه</span>
                      <ChevronLeft className="size-4 text-muted-foreground/50" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shop"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-all"
                    >
                      <span>فروشگاه</span>
                      <ChevronLeft className="size-4 text-muted-foreground/50" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/categories"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-all"
                    >
                      <span>دسته‌بندی‌ها</span>
                      <ChevronLeft className="size-4 text-muted-foreground/50" />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/blog"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-all"
                    >
                      <span>مجله جهان کودک</span>
                      <ChevronLeft className="size-4 text-muted-foreground/50" />
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-muted-foreground mb-4 pr-2">
                  دسترسی سریع
                </span>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/offers"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center rounded-xl px-4 py-3.5 text-[14px] font-bold text-destructive hover:bg-destructive/5 active:bg-destructive/10 transition-colors"
                    >
                      تخفیف‌های ویژه
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-colors"
                    >
                      تماس با ما
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-colors"
                    >
                      درباره ما
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-border/50 p-6 space-y-4 bg-gray-50/50">
            {userName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2 py-1">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{userName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {userRole === "admin" ? "مدیر سیستم" : "مشتری"}
                    </span>
                  </div>
                </div>
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary w-full flex items-center justify-center gap-3 py-3.5"
                >
                  <span>پنل کاربری</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full flex items-center justify-center gap-3 py-4"
              >
                <User className="size-4" />
                <span>ورود / ثبت‌نام</span>
              </Link>
            )}
            <div className="flex justify-center gap-8 py-2">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">پشتیبانی</span>
                <a href={business.phoneHref} className="text-[12px] font-bold text-gray-900">
                  {toFaDigits(business.phoneDisplay)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
