import { useLayoutEffect, useState } from "react";
import { HALF_SHEET_SNAP, SHEET_CHROME_PX } from "./constants";

interface SheetFit {
  setBodyElement: (element: HTMLElement | null) => void;
  setScrollElement: (element: HTMLElement | null) => void;
  setContentElement: (element: HTMLElement | null) => void;
  fitSnapPoint: string | null;
}

export const useSheetFit = (): SheetFit => {
  const [bodyElement, setBodyElement] = useState<HTMLElement | null>(null);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const [contentElement, setContentElement] = useState<HTMLElement | null>(null);
  const [fitBodyPx, setFitBodyPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!bodyElement || !scrollElement || !contentElement) return;

    const measure = () => {
      const naturalBodyPx = bodyElement.offsetHeight - scrollElement.clientHeight + contentElement.offsetHeight;
      const halfBodyCapPx = HALF_SHEET_SNAP * window.innerHeight - SHEET_CHROME_PX;
      setFitBodyPx(naturalBodyPx <= halfBodyCapPx ? Math.ceil(naturalBodyPx) : null);
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(bodyElement);
    resizeObserver.observe(contentElement);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [bodyElement, scrollElement, contentElement]);

  return {
    setBodyElement,
    setScrollElement,
    setContentElement,
    fitSnapPoint: fitBodyPx === null ? null : `${fitBodyPx + SHEET_CHROME_PX}px`,
  };
};
