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

  const cell =
    "min-w-9 rounded-lg bg-on-surface px-1.5 py-1 text-center text-sm font-bold text-surface tabular-nums";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-secondary-container/40 bg-surface-container-lowest p-1.5 pe-4 shadow-sm",
        className,
      )}
    >
      <span className="ms-1 flex items-center gap-1.5 ps-1 text-[11px] font-bold text-secondary">
        <Timer className="size-3.5" aria-hidden />
        پایان:
      </span>
      <span className={cell}>{toFaDigits(String(parts.hours).padStart(2, "0"))}</span>
      <span className="text-xs font-bold text-on-surface-variant">:</span>
      <span className={cell}>{toFaDigits(String(parts.minutes).padStart(2, "0"))}</span>
      <span className="text-xs font-bold text-on-surface-variant">:</span>
      <span className={cell}>{toFaDigits(String(parts.seconds).padStart(2, "0"))}</span>
      {parts.days > 0 ? (
        <span className="ms-1 text-[11px] font-bold text-on-surface-variant">
          +{toFaDigits(parts.days)} روز
        </span>
      ) : null}
    </div>
  );
}
