import { FC } from "react";

interface EndedDotProps {
  sizePx?: number;
}

const DEFAULT_SIZE_PX = 6;

const EndedDot: FC<EndedDotProps> = ({ sizePx = DEFAULT_SIZE_PX }) => (
  <span className="inline-flex flex-none rounded-full bg-neutral-7" style={{ width: sizePx, height: sizePx }} aria-hidden />
);

export default EndedDot;
