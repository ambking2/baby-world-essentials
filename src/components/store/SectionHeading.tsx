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

/** تیتر بخش‌های فروشگاه با خط تزئینی و لینک مشاهدهٔ همه. */
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
        "mb-6 flex flex-wrap items-end gap-3",
        align === "center" ? "flex-col items-center text-center" : "justify-between",
        className,
      )}
    >
      <div>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground sm:text-xl">
          <span className="inline-block h-5 w-1.5 rounded-full bg-brand" aria-hidden />
          {title}
        </h2>
        {subtitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {moreHref ? (
        <Link
          to={moreHref}
          className="group inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-brand hover:text-brand"
        >
          {moreLabel}
          <ChevronLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
