import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, Search, ShoppingBag, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categories } from "@/data/catalog";
import { toFaDigits } from "@/lib/format";

const navLinks = [
  { label: "سرویس خواب چوبی", href: "#categories" },
  { label: "کالسکه و کریر", href: "#categories" },
  { label: "لباس نوزاد", href: "#categories" },
  { label: "اسباب‌بازی", href: "#categories" },
  { label: "خرید قسطی", href: "#installment" },
  { label: "درباره فروشگاه", href: "#store" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="hidden border-b border-border/70 bg-sand md:block">
        <div className="container-page flex h-9 items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              ابهر، خیابان طالقانی، روبه‌روی بانک ملت
            </span>
            <span>ساعت کاری: ۹ صبح تا ۹ شب</span>
          </div>
          <a
            href="tel:+982435223344"
            className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
          >
            <Phone className="size-3.5" aria-hidden="true" />
            {toFaDigits("024-3522-3344")}
          </a>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-3 md:h-20 md:gap-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="باز کردن منو">
              <Menu aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-right">دسته‌بندی‌ها</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-4">
              {categories.map((c) => (
                <a
                  key={c.slug}
                  href="#categories"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-accent"
                >
                  {c.title}
                </a>
              ))}
              <a
                href="#installment"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-accent"
              >
                خرید قسطی ۶ ماهه
              </a>
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
            ج ک
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-foreground md:text-base">سیسمونی جهان کودک</span>
            <span className="text-[11px] text-muted-foreground">ابهر • از سال ۱۳۸۹</span>
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
          <Search
            className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="site-search"
            placeholder="مثلاً: تخت نوزاد چوبی، کالسکه تاشو"
            className="h-11 rounded-xl ps-9"
          />
        </form>

        <div className="ms-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="جست‌وجو">
            <Search aria-hidden="true" />
          </Button>
          <Button variant="outline" className="rounded-xl">
            <ShoppingBag data-icon="inline-start" aria-hidden="true" />
            <span className="hidden sm:inline">سبد خرید</span>
            <span className="text-muted-foreground">({toFaDigits(0)})</span>
          </Button>
        </div>
      </div>

      <nav
        aria-label="دسته‌بندی اصلی"
        className="hidden border-t border-border/70 md:block"
      >
        <div className="container-page flex h-11 items-center gap-6 text-sm">
          {navLinks.map((l) => (
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
