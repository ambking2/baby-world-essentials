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
        "mb-10 flex flex-wrap items-end gap-6",
        align === "center" ? "flex-col items-center text-center" : "justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl space-y-3", align === "center" && "mx-auto")}>
        {eyebrow && (
          <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
        )}
        <h2 className={cn(
          "text-3xl font-bold lg:text-5xl",
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
          className="group flex items-center gap-2 text-sm font-bold transition-premium hover:text-primary"
        >
          {moreLabel}
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}
