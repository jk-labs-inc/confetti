import { FC } from "react";

interface LivePingDotProps {
  sizePx?: number;
  className?: string;
}

const DEFAULT_SIZE_PX = 6;

const LivePingDot: FC<LivePingDotProps> = ({ sizePx = DEFAULT_SIZE_PX, className = "" }) => (
  <span className={`relative flex flex-none ${className}`} style={{ width: sizePx, height: sizePx }} aria-hidden>
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive-10 opacity-75" />
    <span className="relative inline-flex h-full w-full rounded-full bg-positive-11" />
  </span>
);

export default LivePingDot;
