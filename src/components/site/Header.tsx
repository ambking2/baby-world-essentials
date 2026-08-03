import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Heart, Menu, Phone, Search, ShoppingCart, User } from "lucide-react";

import logoBear from "@/assets/logo-bear.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { categoriesQuery } from "@/lib/api/catalog";
import { toFaDigits } from "@/lib/format";

const navRight = [
  { to: "/", label: "خانه" },
  { to: "/about", label: "درباره ما" },
  { to: "/categories", label: "دسته‌بندی‌ها" },
  { to: "/blog", label: "مجله" },
] as const;

const navLeft = [
  { to: "/shop", label: "فروشگاه" },
  { to: "/offers", label: "تخفیف‌ها" },
  { to: "/brands", label: "برندها" },
  { to: "/contact", label: "تماس با ما" },
] as const;

const navLinks = [...navRight, ...navLeft];

const navClass =
  "rounded-full px-3 py-1.5 text-[13px] font-bold tracking-wide text-foreground/80 transition-colors hover:text-primary";

function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <img
        src={logoBear}
        alt=""
        width={512}
        height={512}
        className={small ? "size-9" : "size-11 md:size-14"}
      />
      <span className={small ? "text-base font-black text-primary" : "text-lg font-black text-primary md:text-2xl"}>
        جهان کودک
        <span className="mt-0.5 block text-[10px] font-medium text-muted-foreground">
          سیسمونی و اتاق کودک
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background">
      {/* floating info pill – desktop */}
      <div className="container-page hidden pt-3 md:block">
        <div className="flex h-11 items-center justify-between rounded-full border border-border bg-card px-5 text-xs shadow-soft">
          <div className="flex items-center gap-4">
            <a href="tel:+982435223344" className="flex items-center gap-1.5 font-bold hover:text-primary">
              <Phone className="size-3.5 text-primary" aria-hidden="true" />
              {toFaDigits("024-35223344")}
            </a>
            <span className="hidden text-muted-foreground lg:inline">
              ارسال رایگان سفارش‌های بالای {toFaDigits("۳٬۰۰۰٬۰۰۰")} تومان در ابهر و زنجان
            </span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Link to="/contact" className="flex items-center gap-1.5 hover:text-primary">
              <User className="size-3.5" aria-hidden="true" />
              ورود / ثبت‌نام
            </Link>
            <Link to="/offers" className="flex items-center gap-1.5 hover:text-primary">
              <Heart className="size-3.5" aria-hidden="true" />
              علاقه‌مندی‌ها
            </Link>
            <button type="button" className="flex items-center gap-1.5 font-bold text-foreground hover:text-primary">
              <ShoppingCart className="size-3.5 text-primary" aria-hidden="true" />
              سبد خرید ({toFaDigits(0)})
            </button>
          </div>
        </div>
      </div>

      {/* logo + split navigation – desktop */}
      <div className="container-page hidden items-center justify-between gap-4 py-3 md:flex">
        <nav className="flex flex-1 items-center gap-1">
          {navRight.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={navClass}
              activeProps={{ className: "text-primary underline underline-offset-8 decoration-2" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Logo />

        <nav className="flex flex-1 items-center justify-end gap-1">
          {navLeft.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={navClass}
              activeProps={{ className: "text-primary underline underline-offset-8 decoration-2" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* mobile bar */}
      <div className="border-b border-border md:hidden">
        <div className="container-page flex h-16 items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="منوی اصلی">
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
                    key={l.label}
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

          <Logo small />

          <div className="ms-auto flex items-center">
            <Button variant="ghost" size="icon" className="relative" aria-label="سبد خرید">
              <ShoppingCart aria-hidden="true" />
              <span className="absolute -top-0.5 end-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                ۰
              </span>
            </Button>
          </div>
        </div>
        <div className="container-page pb-3">
          <form className="relative" onSubmit={(e) => e.preventDefault()} role="search">
            <Search
              className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="جست‌وجوی کالا، برند یا دسته‌بندی…"
              aria-label="جست‌وجو در فروشگاه"
              className="h-10 rounded-full border-border bg-secondary ps-10 text-sm"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
