import { useEffect, useRef } from "react";

/**
 * نمایش تدریجی عناصر هنگام اسکرول، با IntersectionObserver.
 *
 * روی عنصر کلاس `reveal` را بگذارید و ref را به والد بدهید:
 *
 * const ref = useReveal<HTMLDivElement>();
 * <section ref={ref}><div className="reveal">...</div></section>
 */
export function useReveal<T extends HTMLElement>(options?: {
  selector?: string;
  threshold?: number;
  stagger?: number;
}): React.RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  const selector = options?.selector ?? ".reveal";
  const threshold = options?.threshold ?? 0.14;
  const stagger = options?.stagger ?? 90;

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (targets.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      for (const target of targets) target.classList.add("reveal-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        visible.forEach((entry, index) => {
          const element = entry.target as HTMLElement;
          element.style.animationDelay = `${index * stagger}ms`;
          element.classList.add("reveal-in");
          observer.unobserve(element);
        });
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [selector, threshold, stagger]);

  return containerRef;
}

/**
 * شمارش معکوس برای تخفیف‌های زمان‌دار — هر ثانیه به‌روز می‌شود.
 */
export function useNow(intervalMs = 1000): number {
  const ref = useRef<number>(Date.now());
  const [, force] = useRerender();

  useEffect(() => {
    const timer = window.setInterval(() => {
      ref.current = Date.now();
      force();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, force]);

  return ref.current;
}

function useRerender(): [number, () => void] {
  const [tick, setTick] = useStateSafe(0);
  return [tick, () => setTick((value) => value + 1)];
}

/* جداسازی useState تا ایمپورتهای بالای فایل کوتاه بماند. */
import { useState } from "react";
function useStateSafe(initial: number) {
  return useState<number>(initial);
}
