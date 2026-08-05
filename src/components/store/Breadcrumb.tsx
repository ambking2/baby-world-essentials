import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export type Crumb = { title: string; href?: string };

/** مسیر راهنما (breadcrumb) بالای صفحات داخلی. */
export function Breadcrumb({ items, className }: { items: Array<Crumb>; className?: string }) {
  return (
    <nav aria-label="مسیر صفحه" className={cn("flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400", className)}>
      <Link to="/" className="transition-colors hover:text-gray-900">
        خانه
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.title}-${index}`} className="flex items-center gap-1">
            <ChevronLeft className="size-3 shrink-0 opacity-40" aria-hidden />
            {item.href && !isLast ? (
              <Link to={item.href} className="transition-colors hover:text-gray-900">
                {item.title}
              </Link>
            ) : (
              <span className={cn(isLast && "text-gray-900")}>{item.title}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
