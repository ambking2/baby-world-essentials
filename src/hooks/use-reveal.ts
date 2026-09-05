import { useCallback, useEffect, useState, type RefCallback } from "react";

/**
 * نمایش تدریجی عناصر هنگام اسکرول، با IntersectionObserver.
 *
 * روی عناصر داخلی کلاس `reveal` را بگذارید و ref را به والد بدهید:
 *
 * const ref = useReveal<HTMLDivElement>();
 * <section ref={ref}><div className="reveal">...</div></section>
 *
 * اگر فرزندان بعد از fetch اضافه شوند (مثل گرید محصول/بلاگ)، MutationObserver
 * آن‌ها را هم مشاهده می‌کند تا روی بار اول نامرئی نمانند.
 */
export function useReveal<T extends HTMLElement>(options?: {
  selector?: string;
  threshold?: number;
  stagger?: number;
  watch?: number | string;
}): RefCallback<T> {
  const [root, setRoot] = useState<T | null>(null);
  const selector = options?.selector ?? ".reveal";
  const threshold = options?.threshold ?? 0.08;
  const stagger = options?.stagger ?? 90;
  const watch = options?.watch;

  const containerRef = useCallback<RefCallback<T>>((node) => {
    setRoot(node);
  }, []);

  useEffect(() => {
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealElement = (element: HTMLElement, index: number) => {
      if (element.classList.contains("reveal-in")) return;
      if (!reducedMotion) {
        element.style.animationDelay = `${index * stagger}ms`;
      }
      element.classList.add("reveal-in");
    };

    if (reducedMotion) {
      const applyAll = () => {
        root.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
          revealElement(element, index);
        });
      };
      applyAll();
      const mutation = new MutationObserver(applyAll);
      mutation.observe(root, { childList: true, subtree: true });
      return () => mutation.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let delayIndex = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          revealElement(element, delayIndex);
          delayIndex += 1;
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: "80px 0px 80px 0px" },
    );

    const scan = () => {
      root.querySelectorAll<HTMLElement>(selector).forEach((target) => {
        if (target.classList.contains("reveal-in")) return;
        observer.observe(target);
      });
    };

    scan();
    const mutation = new MutationObserver(scan);
    mutation.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [root, selector, threshold, stagger, watch]);

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
