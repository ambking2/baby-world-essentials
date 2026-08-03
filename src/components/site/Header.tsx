import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, Search, ShoppingCart, User, MapPin, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categories } from "@/data/catalog";
import { toFaDigits } from "@/lib/format";

const navLinks = [
  { label: "تخفیف‌ها", href: "#offers" },
  { label: "جدیدترین‌ها", href: "#new" },
  { label: "پرفروش‌ها", href: "#best" },
  { label: "خرید قسطی", href: "#trust" },
  { label: "تماس با ما", href: "#footer" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const cartCount = 0;

  return (
    <header id="top" className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="hidden border-b border-border bg-secondary md:block">
        <div className="container-page flex h-9 items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              ابهر، خیابان طالقانی، روبه‌روی بانک ملت
            </span>
            <span>شنبه تا پنجشنبه، ۹ تا ۲۱</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#trust" className="hover:text-primary">
              شرایط ارسال و مرجوعی
            </a>
            <a
              href="tel:+982435223344"
              className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              {toFaDigits("024-3522-3344")}
            </a>
          </div>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-3 md:h-[72px] md:gap-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="باز کردن منو">
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <SheetHeader className="border-b border-border">
              <SheetTitle className="text-start text-sm">دسته‌بندی محصولات</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-2">
              {categories.map((c) => (
                <a
                  key={c.slug}
                  href="#categories"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-accent"
                >
                  {c.title}
                </a>
              ))}
              <div className="my-2 border-t border-border" />
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            ج ک
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-foreground md:text-base">جهان کودک</span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              سیسمونی و اتاق کودک • ابهر
            </span>
          </span>
        </Link>

        <form
          role="search"
          className="relative hidden flex-1 md:block"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="site-search" className="sr-only">
            جست‌وجوی محصولات
          </label>
          <Input
            id="site-search"
            placeholder="نام کالا، برند یا دسته‌بندی را بنویسید"
            className="h-11 rounded-md border-input bg-secondary pe-24 ps-4"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute top-1/2 end-1 h-9 -translate-y-1/2 rounded-md"
          >
            <Search data-icon="inline-start" aria-hidden="true" />
            جست‌وجو
          </Button>
        </form>

        <div className="ms-auto flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="جست‌وجو">
            <Search aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="علاقه‌مندی‌ها" className="hidden sm:flex">
            <Heart aria-hidden="true" />
          </Button>
          <Button variant="ghost" className="rounded-md" aria-label="حساب کاربری">
            <User data-icon="inline-start" aria-hidden="true" />
            <span className="hidden lg:inline">ورود / ثبت‌نام</span>
          </Button>
          <Button variant="outline" className="rounded-md" aria-label="سبد خرید">
            <ShoppingCart data-icon="inline-start" aria-hidden="true" />
            <span className="hidden sm:inline">سبد خرید</span>
            <span className="text-muted-foreground">({toFaDigits(cartCount)})</span>
          </Button>
        </div>
      </div>

      <nav aria-label="دسته‌بندی اصلی" className="hidden border-t border-border md:block">
        <div className="container-page flex h-10 items-center gap-5 text-[13px]">
          {categories.map((c) => (
            <a
              key={c.slug}
              href="#categories"
              className="text-foreground transition-colors hover:text-primary"
            >
              {c.title}
            </a>
          ))}
          <span className="mx-1 h-4 w-px bg-border" />
          {navLinks.slice(0, 3).map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
