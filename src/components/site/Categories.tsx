import { ArrowLeft } from "lucide-react";

import { categories } from "@/data/catalog";

export function Categories() {
  return (
    <section id="categories" className="container-page scroll-mt-28 py-14 md:py-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold md:text-2xl">دسته‌بندی محصولات</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            موجودی فروشگاه به‌صورت هفتگی به‌روزرسانی می‌شود.
          </p>
        </div>
        <a
          href="#featured"
          className="hidden items-center gap-1 text-sm text-primary hover:underline md:flex"
        >
          همه محصولات
          <ArrowLeft className="size-4" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => (
          <a
            key={c.slug}
            href="#featured"
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
          >
            <img
              src={c.image}
              alt={c.title}
              width={900}
              height={900}
              loading="lazy"
              className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="p-3">
              <h3 className="text-sm font-medium">{c.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
