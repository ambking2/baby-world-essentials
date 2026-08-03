import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { categoriesQuery } from "@/lib/api/catalog";

export function CategoryGrid({ compact = false }: { compact?: boolean }) {
  const { data: categories } = useSuspenseQuery(categoriesQuery());

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {categories.map((c) => (
        <Link
          key={c.slug}
          to="/category/$slug"
          params={{ slug: c.slug }}
          className="group overflow-hidden rounded-2xl border border-border bg-card text-center transition-shadow hover:shadow-lift"
        >
          <img
            src={c.image}
            alt={c.title}
            width={400}
            height={400}
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
          <div className="p-3">
            <p className="text-[13px] font-bold text-foreground group-hover:text-primary">
              {c.title}
            </p>
            {!compact ? (
              <p className="mt-1 text-[11px] text-muted-foreground">{c.note}</p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
