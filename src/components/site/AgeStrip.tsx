import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { ageGroupsQuery } from "@/lib/api/catalog";

export function AgeStrip({ activeSlug }: { activeSlug?: string }) {
  const { data: ages } = useSuspenseQuery(ageGroupsQuery());

  return (
    <section className="container-page py-10">
      <h2 className="text-center text-lg font-black text-foreground md:text-xl">
        خرید بر اساس سن کودک
      </h2>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        کالاهای مناسب هر بازه سنی را جدا کرده‌ایم
      </p>

      <ul className="mt-6 flex flex-wrap justify-center gap-5 md:gap-8">
        {ages.map((age) => (
          <li key={age.slug} className="text-center">
            <Link to="/age/$slug" params={{ slug: age.slug }} className="group block">
              <span
                className={`grid size-16 place-items-center rounded-full ${age.color} text-lg font-black text-white shadow-soft transition-transform group-hover:scale-105 md:size-20 md:text-xl ${
                  activeSlug === age.slug ? "ring-4 ring-primary/30" : ""
                }`}
              >
                {age.label}
              </span>
              <span className="mt-2 block text-[11px] text-muted-foreground">{age.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
