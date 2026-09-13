import { cn } from "@/lib/utils";
import { formatToman, toFaDigits } from "@/lib/format";

type PriceProps = {
  price: number;
  effectivePrice?: number;
  discountPercent?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** نمایش قیمت — قیمت فعلی با فونت price-display، قیمت قبلی خط‌خورده و چیپ درصد تخفیف. */
export function Price({ price, effectivePrice, discountPercent, size = "md", className }: PriceProps) {
  const final = effectivePrice ?? price;
  const hasDiscount = final < price;
  const percent = discountPercent && discountPercent > 0 ? discountPercent : Math.round(((price - final) / Math.max(price, 1)) * 100);

  const sizes = {
    sm: "text-sm",
    md: "font-price-display text-price-display",
    lg: "text-2xl font-extrabold",
  } as const;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {hasDiscount ? (
        <>
          <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-[11px] font-bold text-secondary">
            ٪{toFaDigits(percent)}-
          </span>
          <span className="text-xs text-on-surface-variant line-through">
            {formatToman(price)}
          </span>
        </>
      ) : null}
      <span className={cn("font-extrabold text-primary", sizes[size])}>{formatToman(final)}</span>
    </div>
  );
}
