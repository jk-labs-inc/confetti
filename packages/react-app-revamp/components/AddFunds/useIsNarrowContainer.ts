import { useLayoutEffect, useRef, useState } from "react";

const ADD_FUNDS_NARROW_MAX_WIDTH_PX = 320;

export const useIsNarrowContainer = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    setWidth(element.getBoundingClientRect().width);
    const resizeObserver = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  return { ref, isNarrow: width === null || width < ADD_FUNDS_NARROW_MAX_WIDTH_PX };
};
