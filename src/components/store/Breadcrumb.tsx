import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export type Crumb = { title: string; href?: string };

/** مسیر راهنما — مطابق مرجع: خطی ساده و آیتم فعال primary. */
export function Breadcrumb({ items, className }: { items: Array<Crumb>; className?: string }) {
  return (
    <nav aria-label="مسیر صفحه" className={cn("flex flex-wrap items-center gap-2 py-4 font-label-md text-label-md text-on-surface-variant", className)}>
      <Link to="/" className="transition-colors hover:text-primary">
        خانه
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.title}-${index}`} className="flex items-center gap-2">
            <ChevronLeft className="size-4 shrink-0 opacity-40" aria-hidden />
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
