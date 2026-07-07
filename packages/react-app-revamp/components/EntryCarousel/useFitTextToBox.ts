import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const fitCache = new Map<string, number>();

const fontsLoaded = () => typeof document !== "undefined" && document.fonts?.status === "loaded";

export function useFitTextToBox<T extends HTMLElement>(text: string, min = 14, max = 32) {
  const ref = useRef<T>(null);
  const [fontSize, setFontSize] = useState(max);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cacheKey = () => `${text}|${min}|${max}|${el.clientWidth}x${el.clientHeight}`;

    const fits = (px: number) => {
      el.style.fontSize = `${px}px`;
      return el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth;
    };

    const apply = (px: number) => {
      el.style.fontSize = `${px}px`;
      setFontSize(px);
    };

    const readCache = (): boolean => {
      if (!el.clientHeight || !el.clientWidth) return false;
      const cached = fitCache.get(cacheKey());
      if (cached === undefined) return false;
      apply(cached);
      return true;
    };

    const measure = () => {
      if (!el.clientHeight || !el.clientWidth) return; // not laid out yet — the ResizeObserver will re-run it
      if (readCache()) return;
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
      apply(best);
      // pre-webfont metrics would poison the cache; uncached runs re-measure on fonts.ready
      if (fontsLoaded()) fitCache.set(cacheKey(), best);
    };

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    if (!readCache()) schedule();

    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    let cancelled = false;
    if (!fontsLoaded() && typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) schedule();
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [text, min, max]);

  return { ref, fontSize };
}
