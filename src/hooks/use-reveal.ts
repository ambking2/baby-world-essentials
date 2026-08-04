import { useEffect, useRef, useState } from "react";

/**
 * نمایش تدریجی عناصر هنگام اسکرول، با IntersectionObserver.
 *
 * روی عناصر داخلی کلاس `reveal` را بگذارید و ref را به والد بدهید:
 *
 * const ref = useReveal<HTMLDivElement>();
 * <section ref={ref}><div className="reveal">...</div></section>
 */
export function useReveal<T extends HTMLElement>(options?: {
  selector?: string;
  threshold?: number;
  stagger?: number;
}) {
  const containerRef = useRef<T | null>(null);
  const selector = options?.selector ?? ".reveal";
  const threshold = options?.threshold ?? 0.14;
  const stagger = options?.stagger ?? 90;

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (targets.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const target of targets) target.classList.add("reveal-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
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

/** زمان جاری که هر ثانیه به‌روز می‌شود — برای شمارش معکوس تخفیف. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}

/** رفتار چسبندهٔ هدر پس از اسکرول به پایین. */
export function useScrolled(offset = 24): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);

  return scrolled;
}
