import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
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
        "mb-12 lg:mb-20 flex flex-wrap items-end gap-6",
        align === "center" ? "flex-col items-center text-center" : "justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto")}>
        {eyebrow && (
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary/80">
            {eyebrow}
          </span>
        )}
        <h2 className={cn(
          "text-3xl font-bold lg:text-4xl tracking-tight",
          tone === "onDark" ? "text-white" : "text-foreground"
        )}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(
            "text-base leading-relaxed lg:text-lg",
            tone === "onDark" ? "text-white/70" : "text-muted-foreground"
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {moreHref && (
        <Link
          to={moreHref as any}
          className="group flex items-center gap-2 text-sm font-bold transition-premium text-primary hover:opacity-80 border-b-2 border-primary/20 pb-0.5"
        >
          {moreLabel}
          <ChevronLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}
