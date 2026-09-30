import { FC } from "react";

const RING_GRADIENT =
  "conic-gradient(from 0deg, #ffe25b, #fffae1 12%, #f5b700 25%, rgba(255, 226, 91, 0.25) 45%, #ffe25b 60%, #fffae1 72%, #f5b700 85%, #ffe25b)";
const RING_GLOW = "0 0 28px rgba(255, 210, 80, 0.28), 0 0 64px rgba(255, 210, 80, 0.12)";

const WinnerRing: FC = () => (
  <span
    className="pointer-events-none absolute -inset-[3px] z-0 overflow-hidden rounded-[19px]"
    style={{ boxShadow: RING_GLOW }}
    aria-hidden="true"
  >
    <span
      className="absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 animate-[spin_6s_linear_infinite] motion-reduce:animate-none"
      style={{ background: RING_GRADIENT }}
    />
  </span>
);

export default WinnerRing;
