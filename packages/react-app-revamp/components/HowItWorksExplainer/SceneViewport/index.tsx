import { STAGE_HEIGHT_PX, STAGE_STYLE, STAGE_WIDTH_PX } from "@components/HowItWorksExplainer/engine";
import { useParentSize } from "@visx/responsive";
import { FC, ReactNode } from "react";

interface SceneViewportProps {
  children: ReactNode;
}

const SceneViewport: FC<SceneViewportProps> = ({ children }) => {
  const { parentRef, width } = useParentSize({ debounceTime: 0 });
  const scale = width > 0 ? Math.min(1, width / STAGE_WIDTH_PX) : 1;

  return (
    <div
      ref={parentRef}
      className="flex w-full justify-center rounded-[16px] bg-neutral-1"
      style={{ height: STAGE_HEIGHT_PX * scale }}
    >
      <div className="shrink-0" style={{ ...STAGE_STYLE, transform: `scale(${scale})`, transformOrigin: "top center" }}>
        {children}
      </div>
    </div>
  );
};

export default SceneViewport;
