import { RefObject, useCallback, useEffect, useLayoutEffect, useState } from "react";

export function useFitText(ref: RefObject<HTMLElement | null>, text: string, sizes: number[]): number {
  const [largest] = sizes;
  const smallest = sizes[sizes.length - 1];
  const [fontSize, setFontSize] = useState(largest);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Measure the intrinsic width at the largest size, then scale to compare.
    el.style.fontSize = `${largest}px`;
    const available = el.clientWidth;
    const needed = el.scrollWidth;
    const next = available > 0 ? (sizes.find(size => (needed * size) / largest <= available) ?? smallest) : largest;
    el.style.fontSize = `${next}px`;
    setFontSize(prev => (prev === next ? prev : next));
  }, [ref, sizes, largest, smallest]);

  useLayoutEffect(fit, [fit, text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  return fontSize;
}
