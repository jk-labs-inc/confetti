import { STAGE_HEIGHT_PX, STAGE_STYLE, STAGE_WIDTH_PX } from "@components/HowItWorksExplainer/engine";
import { FC, ReactNode } from "react";

const MAX_STAGE_SCALE = 1.3;

interface SceneViewportProps {
  widthPx: number;
  children: ReactNode;
}

const SceneViewport: FC<SceneViewportProps> = ({ widthPx, children }) => {
  const scale = widthPx > 0 ? Math.min(MAX_STAGE_SCALE, widthPx / STAGE_WIDTH_PX) : 1;

  return (
    <div
      className="flex w-full justify-center rounded-[16px] bg-neutral-1"
      style={{ height: STAGE_HEIGHT_PX * scale }}
    >
      <div
        aria-hidden
        className="relative shrink-0 overflow-hidden"
        style={{ ...STAGE_STYLE, transform: `scale(${scale})`, transformOrigin: "top center" }}
      >
        {children}
      </div>
    </div>
  );
};

export default SceneViewport;
