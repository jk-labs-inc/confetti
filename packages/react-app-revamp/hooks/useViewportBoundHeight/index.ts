import { useEffect, useLayoutEffect, useState } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const BOTTOM_GAP_PX = 24;

const measureBoundHeight = (element: HTMLElement): number => {
  const documentTop = element.getBoundingClientRect().top + window.scrollY;

  return Math.max(0, Math.round(window.innerHeight - documentTop - BOTTOM_GAP_PX));
};

interface ViewportBoundHeight {
  ref: (element: HTMLElement | null) => void;
  height: number | undefined;
}

export const useViewportBoundHeight = (enabled: boolean): ViewportBoundHeight => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState<number>();

  useIsomorphicLayoutEffect(() => {
    if (!enabled || !element) {
      setHeight(undefined);
      return;
    }

    const measure = () => setHeight(measureBoundHeight(element));
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [element, enabled]);

  return { ref: setElement, height: enabled ? height : undefined };
};

export default useViewportBoundHeight;
