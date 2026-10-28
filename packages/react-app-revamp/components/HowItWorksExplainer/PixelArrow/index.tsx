import { FC } from "react";

interface PixelArrowProps {
  direction: "left" | "right";
  sizePx: number;
}

const PIXEL_PX = 3;
const ARROW_ROWS = [
  "...##....",
  "....##...",
  ".....##..",
  "########.",
  "#########",
  "########.",
  ".....##..",
  "....##...",
  "...##....",
] as const;
const ARROW_GRID_PX = ARROW_ROWS.length * PIXEL_PX;
const ARROW_PIXELS = ARROW_ROWS.flatMap((row, y) =>
  [...row].flatMap((cell, x) => (cell === "#" ? [{ x: x * PIXEL_PX, y: y * PIXEL_PX }] : [])),
);

const PixelArrow: FC<PixelArrowProps> = ({ direction, sizePx }) => (
  <svg
    width={sizePx}
    height={sizePx}
    viewBox={`0 0 ${ARROW_GRID_PX} ${ARROW_GRID_PX}`}
    fill="currentColor"
    shapeRendering="crispEdges"
    className={direction === "left" ? "-scale-x-100" : undefined}
    aria-hidden
  >
    {ARROW_PIXELS.map(pixel => (
      <rect key={`${pixel.x}-${pixel.y}`} x={pixel.x} y={pixel.y} width={PIXEL_PX} height={PIXEL_PX} />
    ))}
  </svg>
);

export default PixelArrow;
