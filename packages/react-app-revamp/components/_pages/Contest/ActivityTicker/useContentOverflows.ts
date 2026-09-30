import { useEffect, useState } from "react";

interface ContentOverflows {
  containerRef: (element: HTMLElement | null) => void;
  contentRef: (element: HTMLElement | null) => void;
  overflows: boolean;
}

export const useContentOverflows = (): ContentOverflows => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    if (!container || !content) return;

    const resizeObserver = new ResizeObserver(() => setOverflows(content.offsetWidth > container.clientWidth));
    resizeObserver.observe(container);
    resizeObserver.observe(content);

    return () => resizeObserver.disconnect();
  }, [container, content]);

  return { containerRef: setContainer, contentRef: setContent, overflows };
};
