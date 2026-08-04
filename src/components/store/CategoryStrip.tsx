import { Link } from "@tanstack/react-router";

import { SectionHeading } from "@/components/store/SectionHeading";
import { useReveal } from "@/hooks/use-reveal";
import { toFaDigits } from "@/lib/format";
import type { Category } from "@/server/repo/catalog";

/** نوار دسته‌بندی‌های اصلی با تعداد محصولات. */
export function CategoryStrip({ categories }: { categories: Array<Category> }) {
  const containerRef = useReveal<HTMLDivElement>({ stagger: 60 });

  return (
    <section className="container-page py-10">
      <SectionHeading title="خرید بر اساس دسته‌بندی" subtitle="هر چیزی که برای اتاق کودک لازم دارید" moreHref="/search" />

      <div ref={containerRef} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to="/category/$slug"
            params={{ slug: category.slug }}
            className="card-hover reveal group flex flex-col items-center gap-2 rounded-3xl border border-border bg-card p-4 text-center"
          >
            <span className="overflow-hidden rounded-2xl">
              <img
                src={category.image ?? "/images/cat-toys.jpg"}
                alt={category.title}
                loading="lazy"
                className="size-24 object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </span>
            <span className="text-xs font-extrabold text-foreground">{category.title}</span>
            <span className="text-[11px] text-muted-foreground">{toFaDigits(category.productCount)} کالا</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
