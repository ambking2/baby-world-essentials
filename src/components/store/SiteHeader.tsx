import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { business } from "@/data/business";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@/server/repo/catalog";

type SiteHeaderProps = {
  categories: Array<Category>;
  cartCount: number;
  cartTotal: number;
  userName: string | null;
  isAdmin?: boolean;
  announcement?: string | null;
};

export function SiteHeader({
  categories,
  cartCount,
  cartTotal,
  userName,
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
      {/* Announcement Bar */}
      <div className="bg-secondary py-2.5 text-center text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        ارسال رایگان برای تمام سفارش‌های بالای {formatToman(business.freeShippingThreshold)}
      </div>

      {/* Top Utility */}
      <div className="hidden border-b border-border bg-white py-2 lg:block">
        <div className="container-page flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-foreground transition-colors">داستان ما</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">تماس با ما</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">مجله آموزشی</Link>
          </div>
          <div className="flex gap-4">
            <span>تلفن پشتیبانی: {toFaDigits(business.phoneDisplay)}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={cn(
        "z-50 w-full border-b border-border bg-white transition-all duration-300",
        isScrolled ? "sticky top-0 shadow-subtle py-3" : "py-6"
      )}>
        <div className="container-page flex items-center justify-between gap-8">
          {/* Mobile Menu Toggle */}
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {business.name}
            </h1>
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={submitSearch}
            className="hidden max-w-xl flex-1 items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 shadow-sm focus-within:border-primary lg:flex transition-premium"
          >
            <Search className="size-4 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="جستجو در بین محصولات..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-5">
            <Link to={userName ? "/account" : "/auth/login"} className="hidden items-center gap-2 text-sm font-medium hover:text-primary transition-colors lg:flex">
              <User className="size-5" />
              <span>{userName ?? "حساب کاربری"}</span>
            </Link>
            <Link to="/account/wishlist" className="hidden hover:text-primary transition-colors lg:block">
              <Heart className="size-5" />
            </Link>
            <Link to="/cart" className="relative flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <div className="relative">
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                    {toFaDigits(cartCount)}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {cartCount > 0 ? formatToman(cartTotal) : "سبد خرید"}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden border-b border-border bg-white lg:block">
        <div className="container-page flex justify-center py-1">
          <ul className="flex gap-8">
            <li>
              <Link to="/" className="block py-3 text-sm font-semibold hover:text-primary transition-colors">خانه</Link>
            </li>
            <li className="group relative">
              <button className="flex items-center gap-1 py-3 text-sm font-semibold group-hover:text-primary transition-colors">
                دسته‌بندی‌ها
                <ChevronDown className="size-4 transition-transform group-hover:rotate-180" />
              </button>
              {/* Mega Menu */}
              <div className="pointer-events-none absolute right-0 top-full z-[100] w-[800px] bg-white p-8 opacity-0 shadow-premium transition-all group-hover:pointer-events-auto group-hover:opacity-100 rounded-b-2xl border-x border-b border-border">
                <div className="grid grid-cols-4 gap-8">
                  {categories.map((cat) => (
                    <div key={cat.slug}>
                      <Link to="/category/$slug" params={{ slug: cat.slug }} className="mb-4 block text-sm font-bold text-foreground hover:text-primary">
                        {cat.title}
                      </Link>
                      <ul className="space-y-2">
                        {cat.children.map((child) => (
                          <li key={child.slug}>
                            <Link to="/category/$slug" params={{ slug: child.slug }} className="text-xs text-muted-foreground hover:text-primary">
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
              <Link to="/search" className="block py-3 text-sm font-semibold hover:text-primary transition-colors">فروشگاه</Link>
            </li>
            <li>
              <Link to="/offers" className="block py-3 text-sm font-semibold text-destructive hover:opacity-80 transition-colors">تخفیف‌های ویژه</Link>
            </li>
            <li>
              <Link to="/blog" className="block py-3 text-sm font-semibold hover:text-primary transition-colors">مجله نوزاد</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-4/5 flex-col bg-white p-6 animate-fade-in-right">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-lg font-bold">{business.name}</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="size-6" />
              </button>
            </div>
            <ul className="flex flex-col gap-6">
              <li><Link to="/" onClick={() => setMobileOpen(false)} className="text-base font-medium">خانه</Link></li>
              <li><Link to="/search" onClick={() => setMobileOpen(false)} className="text-base font-medium">فروشگاه</Link></li>
              <li><Link to="/blog" onClick={() => setMobileOpen(false)} className="text-base font-medium">مجله</Link></li>
              <li><Link to="/contact" onClick={() => setMobileOpen(false)} className="text-base font-medium">تماس با ما</Link></li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
