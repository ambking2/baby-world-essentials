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
      <div className="bg-primary py-2.5 text-center text-[9px] font-bold tracking-[0.15em] text-white uppercase sm:text-[10px]">
        ارسال رایگان برای تمام سفارش‌های بالای {formatToman(business.freeShippingThreshold)}
      </div>

      {/* Main Header Container */}
      <div className={cn(
        "z-50 w-full border-b border-border bg-white transition-all duration-300",
        isScrolled ? "sticky top-0 shadow-premium py-3" : "py-5 lg:py-7"
      )}>
        <div className="container-page flex items-center justify-between gap-6 lg:gap-12">
          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 -ms-2" onClick={() => setMobileOpen(true)}>
            <Menu className="size-6 text-gray-900" />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              {business.name}
            </h1>
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={submitSearch}
            className="hidden max-w-xl flex-1 items-center gap-4 rounded-xl border border-border bg-[#F9F9F9] px-5 py-3 focus-within:border-foreground/20 focus-within:bg-white lg:flex transition-all duration-300"
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
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to={userName ? "/account" : "/auth/login"} className="hidden items-center gap-2.5 text-[13px] font-bold text-gray-900 hover:text-primary transition-colors lg:flex uppercase tracking-wide">
              <User className="size-5" />
              <span>{userName ?? "حساب کاربری"}</span>
            </Link>
            <Link to="/account/wishlist" className="hidden text-gray-900 hover:text-primary transition-colors lg:block">
              <Heart className="size-5" />
            </Link>
            <Link to="/cart" className="relative flex items-center gap-3 text-[13px] font-bold text-gray-900 hover:text-primary transition-colors group">
              <div className="relative">
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {toFaDigits(cartCount)}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-[10px] text-muted-foreground font-medium mb-1 group-hover:text-primary/70 transition-colors uppercase tracking-widest">سبد خرید</span>
                <span className="font-bold">
                  {cartCount > 0 ? formatToman(cartTotal) : "۰ تومان"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden border-b border-border bg-white lg:block sticky top-[73px] z-40">
        <div className="container-page flex justify-center">
          <ul className="flex gap-12">
            <li>
              <Link to="/" className="relative block py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">خانه</Link>
            </li>
            <li className="group relative">
              <button className="flex items-center gap-2 py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-900 group-hover:text-primary transition-colors">
                دسته‌بندی‌ها
                <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
              </button>
              {/* Mega Menu - Refined with shadows and spacing */}
              <div className="invisible absolute right-0 top-full z-[100] w-[1000px] translate-y-4 bg-white p-12 opacity-0 shadow-deep transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 rounded-b-[24px] border border-border border-t-0">
                <div className="grid grid-cols-4 gap-12">
                  {categories.map((cat) => (
                    <div key={cat.slug} className="space-y-6">
                      <Link to="/category/$slug" params={{ slug: cat.slug }} className="block text-[13px] font-bold text-gray-900 hover:text-primary transition-colors uppercase tracking-wide">
                        {cat.title}
                      </Link>
                      <ul className="space-y-3.5 border-r border-border/40 pr-5">
                        {cat.children.map((child) => (
                          <li key={child.slug}>
                            <Link to="/category/$slug" params={{ slug: child.slug }} className="text-[12px] text-muted-foreground hover:text-primary hover:translate-x-[-4px] transition-all inline-block font-medium">
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
              <Link to="/search" className="relative block py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">فروشگاه</Link>
            </li>
            <li>
              <Link to="/offers" className="relative block py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-destructive hover:opacity-80 transition-colors">تخفیف‌های ویژه</Link>
            </li>
            <li>
              <Link to="/blog" className="relative block py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">مجله آموزشی</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-[300px] flex-col bg-white p-8 shadow-deep animate-fade-in-right h-full">
            <div className="mb-10 flex items-center justify-between">
              <span className="text-2xl font-bold tracking-tight">{business.name}</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-full bg-muted/50 p-2 hover:bg-muted transition-colors">
                <X className="size-6 text-gray-900" />
              </button>
            </div>
            
            <div className="mb-8">
              <form onSubmit={submitSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input 
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="جستجوی محصول..." 
                  className="w-full bg-[#F9F9F9] border border-border rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:border-primary/30"
                />
              </form>
            </div>

            <nav className="flex-1 overflow-y-auto hide-scrollbar">
              <ul className="flex flex-col gap-2">
                <li><Link to="/" onClick={() => setMobileOpen(false)} className="block py-4 text-[15px] font-bold border-b border-border/30 hover:text-primary">خانه</Link></li>
                <li><Link to="/search" onClick={() => setMobileOpen(false)} className="block py-4 text-[15px] font-bold border-b border-border/30 hover:text-primary">فروشگاه</Link></li>
                <li><Link to="/categories" onClick={() => setMobileOpen(false)} className="block py-4 text-[15px] font-bold border-b border-border/30 hover:text-primary">دسته‌بندی‌ها</Link></li>
                <li><Link to="/blog" onClick={() => setMobileOpen(false)} className="block py-4 text-[15px] font-bold border-b border-border/30 hover:text-primary">مجله جهان کودک</Link></li>
                <li><Link to="/contact" onClick={() => setMobileOpen(false)} className="block py-4 text-[15px] font-bold border-b border-border/30 hover:text-primary">تماس با ما</Link></li>
              </ul>
            </nav>
            
            <div className="mt-auto pt-8 border-t border-border space-y-4">
              <Link to="/auth/login" className="btn-primary w-full text-center">ورود / ثبت‌نام</Link>
              <div className="flex justify-center gap-6">
                 {/* Social links could go here */}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}