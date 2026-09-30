import { useEffect, useState } from "react";

const BOTTOM_GAP_PX = 24;

export const useVisibleViewportMaxHeight = (): ((element: HTMLElement | null) => void) => {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const top = Math.max(0, element.getBoundingClientRect().top);
      element.style.maxHeight = `${Math.max(0, Math.round(window.innerHeight - top - BOTTOM_GAP_PX))}px`;
    };
    const scheduleMeasure = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [element]);

  return setElement;
};

export default useVisibleViewportMaxHeight;
