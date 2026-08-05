import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  moreHref?: string;
  moreLabel?: string;
  align?: "start" | "center";
  className?: string;
};

export function SectionHeading({
  title,
  subtitle,
  moreHref,
  moreLabel = "مشاهدهٔ همه",
  align = "start",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-7 flex flex-wrap items-end gap-4",
        align === "center" ? "flex-col items-center text-center" : "justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        <div className={cn("flex items-center gap-3", align === "center" && "justify-center")}>
          <span className="grid size-12 place-items-center rounded-[1.3rem] bg-gradient-to-br from-brand to-sale text-white shadow-lift ring-4 ring-brand/10">
            <span className="size-3 rounded-full bg-white/40 blur-[1px] shadow-[0_0_8px_rgba(255,255,255,0.8)]" aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-black text-foreground sm:text-[1.65rem]">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm leading-7 text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      {moreHref ? (
        <Link
          to={moreHref}
          className="group inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-extrabold text-foreground shadow-soft transition-colors hover:border-brand hover:text-brand"
        >
          {moreLabel}
          <ChevronLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
