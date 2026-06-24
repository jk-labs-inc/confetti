import { RefObject, useCallback, useEffect, useLayoutEffect, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const FIT_SAFETY_PX = 4;

export function useFitText(
  ref: RefObject<HTMLElement | null>,
  text: string,
  { min, max }: { min: number; max: number },
): number {
  const [fontSize, setFontSize] = useState(max);

  const fit = useCallback(() => {
    const el = ref.current;
    const container = el?.parentElement;
    if (!el || !container) return;

    const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
    const children = Array.from(container.children);
    const occupiedBySiblings = children.reduce(
      (total, child) => (child === el ? total : total + (child as HTMLElement).offsetWidth),
      0,
    );
    const available =
      container.clientWidth - occupiedBySiblings - gap * Math.max(0, children.length - 1) - FIT_SAFETY_PX;

    const current = parseFloat(getComputedStyle(el).fontSize) || max;
    const needed = el.scrollWidth;
    const ideal = needed > 0 ? (available * current) / needed : max;
    const next = Math.floor(Math.min(max, Math.max(min, ideal)));
    setFontSize(prev => (prev === next ? prev : next));
  }, [ref, min, max]);

  useIsomorphicLayoutEffect(fit, [fit, text]);

  useEffect(() => {
    const el = ref.current;
    const container = el?.parentElement;
    if (!el || !container) return;

    let cancelled = false;
    const refit = () => {
      if (!cancelled) fit();
    };

    const observer = new ResizeObserver(refit);
    observer.observe(container);
    for (const child of Array.from(container.children)) {
      if (child !== el) observer.observe(child);
    }
    document.fonts?.ready?.then(refit);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [ref, fit]);

  return fontSize;
}
