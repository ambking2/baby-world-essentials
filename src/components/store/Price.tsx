import { cn } from "@/lib/utils";
import { formatToman, toFaDigits } from "@/lib/format";

type PriceProps = {
  price: number;
  effectivePrice?: number;
  discountPercent?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** نمایش قیمت با خط خوردگی قیمت قبلی و برچسب درصد تخفیف. */
export function Price({ price, effectivePrice, discountPercent, size = "md", className }: PriceProps) {
  const final = effectivePrice ?? price;
  const hasDiscount = final < price;
  const percent = discountPercent && discountPercent > 0 ? discountPercent : Math.round(((price - final) / Math.max(price, 1)) * 100);

  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  } as const;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {hasDiscount ? (
        <>
          <span className="bg-destructive px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-tight">
            {toFaDigits(percent)}٪
          </span>
          <span className="text-xs text-muted-foreground line-through decoration-destructive/30">
            {formatToman(price)}
          </span>
        </>
      ) : null}
      <span className={cn("font-bold text-foreground", sizes[size])}>{formatToman(final)}</span>
    </div>
  );
}
