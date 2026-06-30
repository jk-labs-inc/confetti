import { RefObject, useCallback, useEffect, useState } from "react";

interface ScrollEdges {
  atStart: boolean;
  atEnd: boolean;
}

export function useScrollEdges(ref: RefObject<HTMLElement | null>): ScrollEdges {
  const [edges, setEdges] = useState<ScrollEdges>({ atStart: true, atEnd: true });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const atStart = el.scrollLeft <= 1;
    const atEnd = el.scrollLeft >= max - 1;
    setEdges(prev => (prev.atStart === atStart && prev.atEnd === atEnd ? prev : { atStart, atEnd }));
  }, [ref]);

  useEffect(update);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  return edges;
}
