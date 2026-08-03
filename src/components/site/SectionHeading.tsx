type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: "default" | "onDark";
};

/** Centered heading with a small hand-drawn squiggle under it. */
export function SectionHeading({ eyebrow, title, subtitle, tone = "default" }: Props) {
  return (
    <div className="text-center">
      {eyebrow ? (
        <p
          className={
            tone === "onDark"
              ? "text-[11px] font-medium text-white/70"
              : "text-[11px] font-medium text-muted-foreground"
          }
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={
          tone === "onDark"
            ? "mt-1 text-lg font-black text-white md:text-2xl"
            : "mt-1 text-lg font-black text-foreground md:text-2xl"
        }
      >
        {title}
      </h2>
      <svg
        aria-hidden="true"
        viewBox="0 0 90 10"
        className="mx-auto mt-2 h-2.5 w-20 text-primary"
      >
        <path
          d="M2 7 C8 1, 14 1, 20 7 S32 13, 38 7 S50 1, 56 7 S68 13, 74 7 S86 1, 88 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {subtitle ? (
        <p
          className={
            tone === "onDark"
              ? "mx-auto mt-3 max-w-2xl text-xs leading-7 text-white/80 md:text-[13px]"
              : "mx-auto mt-3 max-w-2xl text-xs leading-7 text-muted-foreground md:text-[13px]"
          }
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
