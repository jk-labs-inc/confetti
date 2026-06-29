import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useFitTextToBox<T extends HTMLElement>(text: string, min = 14, max = 32) {
  const ref = useRef<T>(null);
  const [fontSize, setFontSize] = useState(max);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fits = (px: number) => {
      el.style.fontSize = `${px}px`;
      return el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth;
    };

    const measure = () => {
      if (!el.clientHeight || !el.clientWidth) return; // not laid out yet — the ResizeObserver will re-run it
      let lo = min;
      let hi = max;
      if (fits(hi)) {
        lo = hi; // largest size already fits, no search needed
      } else {
        while (hi - lo > 0.5) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) lo = mid;
          else hi = mid;
        }
      }
      const best = Math.max(min, Math.floor(lo));
      el.style.fontSize = `${best}px`;
      setFontSize(best);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, min, max]);

  return { ref, fontSize };
}
