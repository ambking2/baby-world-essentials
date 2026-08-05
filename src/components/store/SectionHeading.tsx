import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string | null;
  moreHref?: string;
  moreLabel?: string;
  align?: "start" | "center";
  className?: string;
  tone?: "default" | "onDark";
};

export function SectionHeading({
  title,
  eyebrow,
  subtitle,
  moreHref,
  moreLabel = "مشاهدهٔ همه",
  align = "start",
  className,
  tone = "default",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 lg:mb-16 flex flex-wrap items-end gap-6",
        align === "center" ? "flex-col items-center text-center" : "justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl space-y-2", align === "center" && "mx-auto")}>
        {eyebrow && (
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
        )}
        <h2 className={cn(
          "text-2xl font-bold lg:text-3xl tracking-tight text-gray-900",
          tone === "onDark" ? "text-white" : "text-gray-900"
        )}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(
            "text-sm leading-relaxed lg:text-base",
            tone === "onDark" ? "text-white/70" : "text-muted-foreground"
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {moreHref && (
        <Link
          to={moreHref as any}
          className="group flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest transition-all duration-250 text-gray-900 hover:text-primary border-b border-gray-900/10 hover:border-primary pb-0.5"
        >
          {moreLabel}
          <ChevronLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}
