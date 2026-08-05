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
import { useEffect, useState } from "react";

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
      <div className="bg-primary py-2 text-center text-[9px] font-semibold tracking-[0.2em] text-white uppercase sm:text-[10px]">
        ارسال رایگان برای تمام سفارش‌های بالای {formatToman(business.freeShippingThreshold)}
      </div>

      {/* Main Header Container */}
      <div className={cn(
        "z-50 w-full border-b border-border bg-white transition-all duration-300",
        isScrolled ? "sticky top-0 shadow-sm py-2" : "py-4 lg:py-6"
      )}>
        <div className="container-page flex items-center justify-between gap-4 lg:gap-8">
          {/* Mobile Menu Toggle */}
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
              {business.name}
            </h1>
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={submitSearch}
            className="hidden max-w-lg flex-1 items-center gap-3 rounded-sm border border-border bg-gray-50 px-4 py-2 focus-within:border-gray-900 focus-within:bg-white lg:flex transition-all duration-300"
          >
            <Search className="size-4 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="جستجو در بین هزاران محصول..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
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
              <span className="hidden sm:inline font-bold">
                {cartCount > 0 ? formatToman(cartTotal) : "سبد خرید"}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden border-b border-border bg-white lg:block">
        <div className="container-page flex justify-center">
          <ul className="flex gap-10">
            <li>
              <Link to="/" className="relative block py-4 text-[11px] font-bold uppercase tracking-widest text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">خانه</Link>
            </li>
            <li className="group relative">
              <button className="flex items-center gap-1.5 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-900 group-hover:text-primary transition-colors">
                دسته‌بندی‌ها
                <ChevronDown className="size-3 transition-transform group-hover:rotate-180" />
              </button>
              {/* Mega Menu */}
              <div className="invisible absolute right-0 top-full z-[100] w-[900px] translate-y-2 bg-white p-10 opacity-0 shadow-2xl transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 rounded-b-2xl border border-border border-t-0">
                <div className="grid grid-cols-4 gap-12">
                  {categories.map((cat) => (
                    <div key={cat.slug} className="space-y-4">
                      <Link to="/category/$slug" params={{ slug: cat.slug }} className="block text-sm font-bold text-foreground hover:text-primary transition-colors">
                        {cat.title}
                      </Link>
                      <ul className="space-y-2.5 border-r border-border/50 pr-4">
                        {cat.children.map((child) => (
                          <li key={child.slug}>
                            <Link to="/category/$slug" params={{ slug: child.slug }} className="text-xs text-muted-foreground hover:text-primary hover:translate-x-[-4px] transition-all inline-block">
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
              <Link to="/search" className="relative block py-4 text-[11px] font-bold uppercase tracking-widest text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">فروشگاه</Link>
            </li>
            <li>
              <Link to="/offers" className="relative block py-4 text-[11px] font-bold uppercase tracking-widest text-destructive hover:opacity-80 transition-colors">تخفیف‌های ویژه</Link>
            </li>
            <li>
              <Link to="/blog" className="relative block py-4 text-[11px] font-bold uppercase tracking-widest text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">مجله آموزشی</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-[280px] flex-col bg-white p-6 shadow-2xl animate-fade-in-right">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xl font-bold tracking-tight">{business.name}</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-full bg-muted p-1 hover:bg-muted-foreground/10 transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              <li><Link to="/" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-bold hover:text-primary">خانه</Link></li>
              <li><Link to="/search" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-bold hover:text-primary">فروشگاه</Link></li>
              <li><Link to="/blog" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-bold hover:text-primary">مجله</Link></li>
              <li><Link to="/contact" onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-bold hover:text-primary">تماس با ما</Link></li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
