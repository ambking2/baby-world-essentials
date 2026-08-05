import { Timer } from "lucide-react";

import { cn } from "@/lib/utils";
import { countdownParts, toFaDigits } from "@/lib/format";
import { useNow } from "@/hooks/use-reveal";

/** شمارش معکوس پایان تخفیف زمان‌دار. */
export function Countdown({ endsAt, className }: { endsAt: string | null; className?: string }) {
  const now = useNow(1000);
  if (!endsAt) return null;

  const parts = countdownParts(endsAt);
  if (!parts || parts.finished) return null;

  const cell = "min-w-9 rounded-lg bg-charcoal/90 px-1.5 py-1 text-center text-sm font-bold text-white tabular-nums";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Timer className="size-4 text-sale" aria-hidden />
      <span className={cell}>{toFaDigits(String(parts.hours).padStart(2, "0"))}</span>
      <span className="text-xs font-bold text-muted-foreground">:</span>
      <span className={cell}>{toFaDigits(String(parts.minutes).padStart(2, "0"))}</span>
      <span className="text-xs font-bold text-muted-foreground">:</span>
      <span className={cell}>{toFaDigits(String(parts.seconds).padStart(2, "0"))}</span>
      {parts.days > 0 ? (
        <span className="ms-1 text-xs font-semibold text-muted-foreground">+{toFaDigits(parts.days)} روز</span>
      ) : null}
    </div>
  );
}
