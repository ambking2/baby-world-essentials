import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/format";

type Props = {
  images: string[];
  alt: string;
  discount?: number;
  outOfStock?: boolean;
};

export function ProductGallery({ images, alt, discount = 0, outOfStock = false }: Props) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const frameRef = useRef<HTMLDivElement>(null);

  const main = images[active] ?? images[0]!;

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[72px_1fr]">
      <ul className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
        {images.map((src, index) => (
          <li key={src + index}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-label={`تصویر ${toFaDigits(index + 1)}`}
              aria-current={index === active}
              className={cn(
                "block size-[72px] shrink-0 border bg-sand p-0.5",
                index === active ? "border-primary" : "border-border hover:border-primary/50",
              )}
            >
              <img
                src={src}
                alt=""
                width={144}
                height={144}
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="order-1 sm:order-2">
        <div
          ref={frameRef}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMove}
          className="relative overflow-hidden border border-border bg-sand"
        >
          <img
            src={main}
            alt={alt}
            width={1000}
            height={1000}
            className={cn(
              "aspect-square w-full object-cover transition-transform duration-200",
              zoom && "scale-[1.9]",
              outOfStock && "opacity-70 grayscale",
            )}
            style={{ transformOrigin: origin }}
          />
          {discount > 0 && !outOfStock ? (
            <span className="absolute top-3 start-3 bg-sale px-2 py-1 text-xs font-bold text-sale-foreground">
              ٪{toFaDigits(discount)} تخفیف
            </span>
          ) : null}
          {outOfStock ? (
            <span className="absolute inset-x-0 bottom-0 bg-foreground/75 py-1.5 text-center text-sm font-medium text-background">
              ناموجود
            </span>
          ) : null}
        </div>
        <p className="mt-2 hidden text-[11px] text-muted-foreground lg:block">
          برای بزرگ‌نمایی، نشانگر را روی تصویر نگه دارید.
        </p>
      </div>
    </div>
  );
}
