import { useFitScale } from "@hooks/useFitScale";
import { FC, ReactNode, useRef } from "react";

interface ScaleToFitProps {
  children: ReactNode;
}

const ScaleToFit: FC<ScaleToFitProps> = ({ children }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scale = useFitScale(frameRef, contentRef);

  return (
    <div ref={frameRef} className="min-w-0 max-w-full">
      <div
        ref={contentRef}
        className="flex w-max origin-left"
        style={scale < 1 ? { transform: `scale(${scale})` } : undefined}
      >
        {children}
      </div>
    </div>
  );
};

export default ScaleToFit;
