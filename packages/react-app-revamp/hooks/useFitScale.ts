import { RefObject, useEffect, useState } from "react";

export function useFitScale(
  frameRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const measure = () => {
      const available = frame.clientWidth;
      const natural = content.offsetWidth;
      const next = available > 0 && natural > available ? available / natural : 1;
      setScale(prev => (prev === next ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(content);

    return () => observer.disconnect();
  }, [frameRef, contentRef]);

  return scale;
}
