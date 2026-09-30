import { FC } from "react";

interface WinnerBadgeProps {
  variant?: "floating" | "inline";
}

const BADGE_CLASS_NAME =
  "pointer-events-none flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-gold px-3 py-1 shadow-[0_2px_10px_rgba(0,0,0,0.6)]";
const FLOATING_CLASS_NAME = "absolute -top-3 left-1/2 z-30 -translate-x-1/2";

const WinnerBadge: FC<WinnerBadgeProps> = ({ variant = "floating" }) => (
  <span className={`${BADGE_CLASS_NAME} ${variant === "floating" ? FLOATING_CLASS_NAME : ""}`}>
    <span className="text-[12px] leading-none">🏆</span>
    <span className="font-sabo-filled text-[12px] leading-none text-true-black">winner</span>
  </span>
);

export default WinnerBadge;
