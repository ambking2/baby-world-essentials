import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCount, formatRating } from "@/lib/format";

type RatingProps = {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
};

/** ستاره‌های امتیاز به همراه تعداد نظر. */
export function Rating({ value, count, size = 14, showValue = false, className }: RatingProps) {
  const rounded = Math.round(value);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{ width: size, height: size }}
            className={cn(
              "shrink-0",
              star <= rounded ? "fill-sun text-sun" : "fill-transparent text-muted-foreground/50",
            )}
            aria-hidden
          />
        ))}
      </div>
      {showValue ? <span className="text-xs font-semibold text-foreground">{formatRating(value)}</span> : null}
      {typeof count === "number" && count > 0 ? (
        <span className="text-xs text-muted-foreground">({formatCount(count)} نظر)</span>
      ) : null}
    </div>
  );
}
