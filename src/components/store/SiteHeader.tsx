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
      {/* Announcement Bar */}
      <div className="bg-primary py-2.5 text-center text-[9px] font-bold tracking-[0.15em] text-white uppercase sm:text-[10px]">
        ارسال رایگان برای تمام سفارش‌های بالای {formatToman(business.freeShippingThreshold)}
      </div>

      {/* Main Header Container */}
      <div className={cn(
        "z-50 w-full border-b border-border bg-white transition-all duration-300",
        isScrolled ? "fixed top-0 shadow-premium py-2 lg:py-3" : "relative py-4 lg:py-7"
      )}>
        <div className="container-page flex items-center justify-between gap-6 lg:gap-12">
          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 -ms-2" onClick={() => setMobileOpen(true)}>
            <Menu className="size-6 text-gray-900" />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0 relative z-10 block group">
            <div className="flex items-center gap-3">
              <img 
                src={brandLogoUrl} 
                alt={business.name}
                className="h-10 w-auto sm:h-12 md:h-14 transition-transform group-hover:scale-105" 
              />
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                  {business.name}
                </span>
                <span className="hidden sm:block text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                  Jahan Koodak
                </span>
              </div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={submitSearch}
            className="hidden max-w-xl flex-1 items-center gap-4 rounded-xl border border-border bg-secondary/30 px-5 py-3 focus-within:border-primary/30 focus-within:bg-white lg:flex transition-all duration-300 shadow-subtle focus-within:shadow-premium"
          >
            <Search className="size-4 text-foreground/70" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="جستجو در بین محصولات جهان کودک..."
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to={userName ? "/account" : "/auth/login"} className="hidden items-center gap-2.5 text-[13px] font-bold text-gray-900 hover:text-primary transition-colors lg:flex uppercase tracking-wide group">
              <User className="size-5 transition-transform group-hover:scale-110" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] text-muted-foreground font-medium mb-1 group-hover:text-primary/70 transition-colors uppercase tracking-widest">
                  {userName ? "خوش آمدید" : "ورود"}
                </span>
                <span className="font-bold">{userName ?? "حساب کاربری"}</span>
              </div>
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
      <nav className={cn(
        "hidden border-b border-border bg-white lg:block z-40 transition-all duration-300",
        isScrolled ? "fixed top-[57px] w-full" : "relative"
      )}>
        <div className="container-page flex items-center justify-between">
          <div className="flex-1 flex justify-start pr-8">
            <ul className="flex gap-12">
              <li>
                <Link to="/" className="relative block py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full active:scale-95">خانه</Link>
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
                <Link to="/search" search={{ q: "" }} className="relative block py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">محصولات</Link>
              </li>
              <li>
                <Link to="/offers" className="relative block py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-destructive hover:opacity-80 transition-colors">تخفیف‌های ویژه</Link>
              </li>
              <li>
                <Link to="/blog" className="relative block py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-900 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full">مجله آموزشی</Link>
              </li>
            </ul>
          </div>
          
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-[100] lg:hidden transition-all duration-500",
        mobileOpen ? "visible" : "invisible"
      )}>
        <div 
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ease-in-out",
            mobileOpen ? "opacity-100" : "opacity-0"
          )} 
          onClick={() => setMobileOpen(false)} 
        />
        <div className={cn(
          "absolute inset-y-0 right-0 flex w-[85%] max-w-[340px] flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 p-6">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
              <img src={brandLogoUrl} alt={business.name} className="h-10 w-auto" />
              <span className="text-lg font-bold tracking-tight text-gray-900">{business.name}</span>
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
                className="w-full bg-[#F9F9F9] border border-border rounded-xl py-3.5 pl-10 pr-4 text-[13px] outline-none focus:border-primary/30 focus:bg-white transition-all shadow-subtle"
              />
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-6 pb-8 hide-scrollbar">
            <div className="space-y-8 py-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 pr-2">منوی اصلی</span>
                <ul className="space-y-1">
                  <li><Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-all"><span>خانه</span><ChevronLeft className="size-4 text-muted-foreground/50" /></Link></li>
                  <li><Link to="/search" search={{ q: "" }} onClick={() => setMobileOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-all"><span>فروشگاه</span><ChevronLeft className="size-4 text-muted-foreground/50" /></Link></li>
                  <li><Link to="/categories" onClick={() => setMobileOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-all"><span>دسته‌بندی‌ها</span><ChevronLeft className="size-4 text-muted-foreground/50" /></Link></li>
                  <li><Link to="/blog" onClick={() => setMobileOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-all"><span>مجله جهان کودک</span><ChevronLeft className="size-4 text-muted-foreground/50" /></Link></li>
                </ul>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 pr-2">دسترسی سریع</span>
                <ul className="space-y-1">
                  <li><Link to="/offers" onClick={() => setMobileOpen(false)} className="flex items-center rounded-xl px-4 py-3.5 text-[14px] font-bold text-destructive hover:bg-destructive/5 active:bg-destructive/10 transition-colors">تخفیف‌های ویژه</Link></li>
                  <li><Link to="/contact" onClick={() => setMobileOpen(false)} className="flex items-center rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-colors">تماس با ما</Link></li>
                  <li><Link to="/about" onClick={() => setMobileOpen(false)} className="flex items-center rounded-xl px-4 py-3.5 text-[14px] font-bold text-gray-900 hover:bg-secondary/50 active:bg-secondary transition-colors">درباره ما</Link></li>
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
                    <span className="text-[10px] text-muted-foreground">{userRole === 'admin' ? 'مدیر سیستم' : 'مشتری'}</span>
                  </div>
                </div>
                <Link to="/account" onClick={() => setMobileOpen(false)} className="btn-secondary w-full flex items-center justify-center gap-3 py-3.5">
                  <span>پنل کاربری</span>
                </Link>
              </div>
            ) : (
              <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full flex items-center justify-center gap-3 py-4">
                <User className="size-4" />
                <span>ورود / ثبت‌نام</span>
              </Link>
            )}
            <div className="flex justify-center gap-8 py-2">
               <div className="flex flex-col items-center gap-1">
                 <span className="text-[10px] text-muted-foreground uppercase tracking-widest">پشتیبانی</span>
                 <a href={business.phoneHref} className="text-[12px] font-bold text-gray-900">{toFaDigits(business.phoneDisplay)}</a>
               </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}