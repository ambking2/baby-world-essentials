import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { formatToman, toFaDigits } from "@/lib/format";
import type { Category, Product } from "@/types/catalog";

const tags = ["نوزاد", "سیسمونی", "چوب راش", "کالسکه", "لباس نخی", "اسباب‌بازی"];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-black text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ShopSidebar({
  categories,
  topRated,
  activeCategory,
}: {
  categories: Category[];
  topRated: Product[];
  activeCategory?: string;
}) {
  return (
    <aside className="flex flex-col gap-4">
      <form
        className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          aria-label="جست‌وجو در کالاها"
          placeholder="جست‌وجو در کالاها"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </form>

      <Block title="دسته‌بندی‌ها">
        <ul className="flex flex-col gap-2.5 text-sm">
          <li>
            <Link
              to="/shop"
              className={
                activeCategory ? "text-muted-foreground hover:text-primary" : "font-bold text-primary"
              }
            >
              همه کالاها
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                to="/category/$slug"
                params={{ slug: c.slug }}
                className={
                  activeCategory === c.slug
                    ? "font-bold text-primary"
                    : "text-muted-foreground hover:text-primary"
                }
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="پرامتیازترین‌ها">
        <ul className="flex flex-col gap-3">
          {topRated.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <img
                src={p.image}
                alt=""
                width={56}
                height={56}
                loading="lazy"
                className="size-14 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0">
                <Link
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="line-clamp-2 text-[13px] font-medium leading-5 hover:text-primary"
                >
                  {p.title}
                </Link>
                <p className="mt-1 text-xs font-bold text-primary">
                  {formatToman(p.price)} تومان
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="عضویت در خبرنامه فروشگاه">
        <p className="text-xs leading-6 text-muted-foreground">
          تخفیف‌های هفتگی و کالاهای تازه‌رسیده را برایتان می‌فرستیم.
        </p>
        <form className="mt-3 flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
          <label className="sr-only" htmlFor="sidebar-newsletter">
            ایمیل شما
          </label>
          <input
            id="sidebar-newsletter"
            type="email"
            placeholder="ایمیل شما"
            className="rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-3 focus:ring-ring/30"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            عضویت
          </button>
        </form>
      </Block>

      <Block title="برچسب‌ها">
        <ul className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <li
              key={t}
              className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
      </Block>

      <p className="px-1 text-xs text-muted-foreground">
        تماس با فروشگاه: {toFaDigits("024-35223344")}
      </p>
    </aside>
  );
}
