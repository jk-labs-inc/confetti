import useIsomorphicLayoutEffect from "@hooks/useIsomorphicLayoutEffect";
import { FC, ReactNode, useRef, useState } from "react";

interface ScaledFrameProps {
  width: number;
  height?: number;
  maxWidth: number;
  maxHeight: number;
  children: ReactNode;
}

const ScaledFrame: FC<ScaledFrameProps> = ({ width, height, maxWidth, maxHeight, children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(height ?? 0);

  useIsomorphicLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => setContentHeight(content.offsetHeight);
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(content);
    return () => resizeObserver.disconnect();
  }, []);

  const scale = Math.min(1, maxWidth / width, contentHeight > 0 ? maxHeight / contentHeight : 1);

  return (
    <div inert aria-hidden style={{ width: width * scale, height: contentHeight * scale }}>
      <div ref={contentRef} style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
};

export default ScaledFrame;
