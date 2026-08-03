import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { categoriesQuery } from "@/lib/api/catalog";

export function CategoryStrip() {
  const { data: categories } = useSuspenseQuery(categoriesQuery());

  return (
    <section id="categories" className="container-page scroll-mt-24 py-8">
      <div className="border-b border-border pb-3">
        <h2 className="text-base font-bold text-foreground md:text-lg">خرید بر اساس دسته‌بندی</h2>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/"
            className="flex flex-col items-center gap-2 border border-border bg-card p-3 text-center transition-colors hover:border-primary/50"
          >
            <img
              src={c.image}
              alt={c.title}
              width={200}
              height={200}
              loading="lazy"
              className="size-16 rounded-full object-cover md:size-20"
            />
            <span className="text-xs font-medium text-foreground">{c.title}</span>
            <span className="hidden text-[11px] text-muted-foreground md:block">{c.note}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
