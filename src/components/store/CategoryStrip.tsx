import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";


import { SectionHeading } from "@/components/store/SectionHeading";
import { useReveal } from "@/hooks/use-reveal";
import { toFaDigits } from "@/lib/format";
import type { Category } from "@/server/repo/catalog";

export function CategoryStrip({ categories }: { categories: any[] }) {
  const containerRef = useReveal<HTMLDivElement>({ stagger: 60 });

  return (
    <section className="container-page py-10">
      <SectionHeading
        title="خرید بر اساس حال‌وهوای اتاق و نیاز کودک"
        subtitle="از سرویس خواب تا پوشاک و اسباب‌بازی، مسیر خرید را از همین‌جا انتخاب کنید"
        moreHref="/search"
      />

      <div ref={containerRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.slice(0, 6).map((category, index) => (
          <Link
            key={category.id || category.slug}
            to="/category/$slug"
            params={{ slug: category.slug }}
            className={`reveal group relative overflow-hidden rounded-2xl border border-border shadow-sm transition-all duration-700 hover:shadow-md hover:-translate-y-1 ${index === 0 ? "lg:col-span-2" : ""}`}
          >
            <img
              src={category.image ?? "/images/cat-toys.jpg"}
              alt={category.title}
              loading="lazy"
              className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${index === 0 ? "h-72" : "h-64"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white">{category.title}</h3>
                {category.blurb ? <p className="mt-1 max-w-sm text-xs leading-6 text-white/80">{category.blurb}</p> : null}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-primary shadow-sm transition-transform group-hover:scale-105 active:scale-95">
                <Sparkles className="size-3.5 text-brand" aria-hidden />
                {toFaDigits(category.productCount)} کالا
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
