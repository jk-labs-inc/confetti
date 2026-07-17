import { RefObject, useEffect, useLayoutEffect, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useFitRowText(ref: RefObject<HTMLElement | null>, { min, max }: { min: number; max: number }): number {
  const [fontSize, setFontSize] = useState(max);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let raf = 0;

    const fits = (px: number) => {
      el.style.fontSize = `${px}px`;
      return el.scrollWidth <= el.clientWidth;
    };

    const measure = () => {
      if (cancelled || !el.clientWidth) return; // not laid out yet — the ResizeObserver will re-run it

      let best = max;
      if (!fits(max)) {
        let lo = min;
        let hi = max;
        while (hi - lo > 0.5) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) lo = mid;
          else hi = mid;
        }
        best = Math.max(min, Math.floor(lo));
      }

      el.style.fontSize = `${best}px`;
      setFontSize(best);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(el);
    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true });

    document.fonts?.ready?.then(() => {
      if (!cancelled) schedule();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref, min, max]);

  return fontSize;
}
