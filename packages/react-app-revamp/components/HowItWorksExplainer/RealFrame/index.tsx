import { CSSProperties, FC, ReactNode } from "react";

interface RealFrameProps {
  layoutWidthPx: number;
  stageWidthPx: number;
  stageHeightPx?: number;
  style?: CSSProperties;
  children: ReactNode;
}

const RealFrame: FC<RealFrameProps> = ({ layoutWidthPx, stageWidthPx, stageHeightPx, style, children }) => (
  <div
    inert
    aria-hidden
    className="absolute [&_[data-hover-info]]:hidden"
    style={{ width: stageWidthPx, height: stageHeightPx, ...style }}
  >
    <div
      style={{
        width: layoutWidthPx,
        transform: `scale(${stageWidthPx / layoutWidthPx})`,
        transformOrigin: "top left",
      }}
    >
      {children}
    </div>
  </div>
);

export default RealFrame;
