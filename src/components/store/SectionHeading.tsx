import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string | null | undefined;
  moreHref?: string;
  moreLabel?: string | null | undefined;
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
        "mb-12 flex flex-wrap items-end gap-6",
        align === "center" ? "flex-col items-center text-center" : "justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl space-y-2", align === "center" && "mx-auto")}>
        {eyebrow && (
          <span className="mb-1 block text-[12px] font-bold text-primary">{eyebrow}</span>
        )}
        <h2
          className={cn(
            "font-headline-md text-headline-md tracking-tight",
            tone === "onDark" ? "text-white" : "text-on-surface",
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "font-body-md text-body-md leading-8",
              tone === "onDark" ? "text-white/75" : "text-on-surface-variant",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {moreHref && (
        <Link
          to={moreHref as any}
          className="group flex items-center gap-1 border-b border-primary/20 pb-0.5 text-label-md font-label-md text-primary transition-all hover:border-primary"
        >
          {moreLabel}
          <ChevronLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}
