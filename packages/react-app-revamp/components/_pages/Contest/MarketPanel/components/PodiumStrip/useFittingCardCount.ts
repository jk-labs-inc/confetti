import { useEffect, useState } from "react";

interface FittingCardCountOptions {
  cardMinWidthPx: number;
  gapPx: number;
  maxCount: number;
}

interface FittingCardCount {
  ref: (element: HTMLElement | null) => void;
  countFor: (reservedPx: number) => number;
}

export const useFittingCardCount = ({ cardMinWidthPx, gapPx, maxCount }: FittingCardCountOptions): FittingCardCount => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    if (!element) return;

    const resizeObserver = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [element]);

  const countFor = (reservedPx: number) =>
    width === undefined
      ? maxCount
      : Math.min(maxCount, Math.max(1, Math.floor((width - reservedPx + gapPx) / (cardMinWidthPx + gapPx))));

  return { ref: setElement, countFor };
};

export default useFittingCardCount;
