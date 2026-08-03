import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Crumb = { label: string; to?: "/shop" | "/categories" | "/blog" | "/brands" | "/offers" };

const tones = {
  purple: "bg-[linear-gradient(180deg,oklch(0.6_0.19_30),oklch(0.75_0.14_35))]",
  coral: "bg-[linear-gradient(180deg,oklch(0.6_0.19_25),oklch(0.78_0.13_28))]",
  sky: "bg-[linear-gradient(180deg,oklch(0.6_0.13_235),oklch(0.78_0.09_230))]",
} as const;

export function PageHeader({
  title,
  description,
  crumbs = [],
  tone = "coral",
  children,
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  tone?: keyof typeof tones;
  children?: ReactNode;
}) {
  return (
    <section className={`relative overflow-hidden ${tones[tone]}`}>
      <div className="container-page pt-10 pb-16 text-center md:pt-14 md:pb-20">
        <p className="text-[11px] tracking-[0.3em] text-primary-foreground/70">شما اینجا هستید</p>

        <nav
          aria-label="مسیر صفحه"
          className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-primary-foreground/85"
        >
          <Link to="/" className="hover:text-primary-foreground">
            خانه
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {c.to ? (
                <Link to={c.to} className="hover:text-primary-foreground">
                  {c.label}
                </Link>
              ) : null}
            </span>
          ))}
        </nav>

        <h1 className="mt-1 text-2xl font-black text-primary-foreground md:text-4xl">{title}</h1>

        <svg
          aria-hidden="true"
          viewBox="0 0 120 12"
          className="mx-auto mt-3 h-3 w-28 text-primary-foreground/70"
        >
          <path
            d="M2 8 C10 -2, 18 14, 26 6 S42 -2, 50 8 S66 14, 74 6 S90 -2, 98 8 S114 12, 118 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {description ? (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-primary-foreground/85">
            {description}
          </p>
        ) : null}
        {children}
      </div>
      <div className="cloud-bottom" aria-hidden="true" />
      <div className="zigzag-bottom" aria-hidden="true" />
    </section>
  );
}
