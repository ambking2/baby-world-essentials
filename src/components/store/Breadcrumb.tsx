import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export type Crumb = { title: string; href?: string };

/** مسیر راهنما (breadcrumb) بالای صفحات داخلی. */
export function Breadcrumb({ items, className }: { items: Array<Crumb>; className?: string }) {
  return (
    <nav aria-label="مسیر صفحه" className={cn("flex flex-wrap items-center gap-1 text-xs text-muted-foreground", className)}>
      <Link to="/" className="transition-colors hover:text-primary">
        خانه
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.title}-${index}`} className="flex items-center gap-1">
            <ChevronLeft className="size-3.5 shrink-0 opacity-60" aria-hidden />
            {item.href && !isLast ? (
              <Link to={item.href} className="transition-colors hover:text-primary">
                {item.title}
              </Link>
            ) : (
              <span className={cn(isLast && "font-bold text-primary")}>{item.title}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
