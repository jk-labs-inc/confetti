import { RefObject, useLayoutEffect, useState } from "react";

const CARD_MIN_WIDTH_PX = 340;
const COLUMN_GAP_PX = 14;
const MIN_COLUMNS = 2;
const MAX_COLUMNS = 4;

const fitColumnCount = (widthPx: number): number =>
  Math.min(
    MAX_COLUMNS,
    Math.max(MIN_COLUMNS, Math.floor((widthPx + COLUMN_GAP_PX) / (CARD_MIN_WIDTH_PX + COLUMN_GAP_PX))),
  );

export const useMasonryColumnCount = (containerRef: RefObject<HTMLElement | null>): number | null => {
  const [columnCount, setColumnCount] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    setColumnCount(fitColumnCount(element.getBoundingClientRect().width));
    const resizeObserver = new ResizeObserver(([entry]) => setColumnCount(fitColumnCount(entry.contentRect.width)));
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return columnCount;
};
