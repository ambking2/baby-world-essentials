import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Menu, Phone, Search, ShoppingCart, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categoriesQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

const navLinks = [
  { to: "/", label: "خانه" },
  { to: "/shop", label: "فروشگاه" },
  { to: "/categories", label: "دسته‌بندی‌ها" },
  { to: "/brands", label: "برندها" },
  { to: "/offers", label: "تخفیف‌ها" },
  { to: "/blog", label: "مجله" },
  { to: "/about", label: "درباره ما" },
  { to: "/contact", label: "تماس" },
] as const;

export function Header() {
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-primary text-primary-foreground">
        <div className="container-page flex h-9 items-center justify-between text-[11px] md:text-xs">
          <a href="tel:+982435223344" className="flex items-center gap-1.5 hover:opacity-90">
            <Phone className="size-3.5" aria-hidden="true" />
            {toFaDigits("024-35223344")}
          </a>
          <p className="hidden sm:block">
            ارسال رایگان سفارش‌های بالای {toFaDigits("۳٬۰۰۰٬۰۰۰")} تومان در ابهر و زنجان
          </p>
          <Link to="/contact" className="hover:opacity-90">
            پیگیری سفارش
          </Link>
        </div>
      </div>

      <div className="border-b border-border bg-background">
        <div className="container-page flex h-16 items-center gap-3 md:h-20 md:gap-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="منوی اصلی">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-start">منوی جهان کودک</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-8">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                    activeProps={{ className: "bg-secondary text-primary" }}
                  >
                    {l.label}
                  </Link>
                ))}
                <p className="mt-4 px-3 text-xs font-bold text-muted-foreground">دسته‌بندی‌ها</p>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {c.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-base font-black text-primary-foreground">
              ج
            </span>
            <span className="text-lg font-black leading-none text-primary md:text-xl">
              جهان کودک
              <span className="mt-0.5 block text-[10px] font-medium text-muted-foreground">
                سیسمونی و اتاق کودک
              </span>
            </span>
          </Link>

          <form
            className="relative hidden flex-1 md:block"
            onSubmit={(e) => e.preventDefault()}
            role="search"
          >
            <Search
              className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="جست‌وجوی کالا، برند یا دسته‌بندی…"
              aria-label="جست‌وجو در فروشگاه"
              className="h-11 rounded-full border-border bg-secondary/60 ps-10 pe-28 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute inset-y-1.5 end-1.5 rounded-full px-5 text-xs"
            >
              جست‌وجو
            </Button>
          </form>

          <div className="ms-auto flex items-center gap-1 md:ms-0">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="جست‌وجو">
              <Search aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="حساب کاربری">
              <User aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" aria-label="سبد خرید">
              <ShoppingCart aria-hidden="true" />
              <span className="absolute -top-0.5 end-0.5 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                ۰
              </span>
            </Button>
          </div>
        </div>
      </div>

      <nav className="hidden border-b border-border bg-background lg:block">
        <div className="container-page flex h-11 items-center gap-1 text-sm">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3.5 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              activeProps={{ className: "bg-secondary text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
