import { FC } from "react";

type ConfettiPlacement = "above" | "left";

interface RewardsCoinConfettiProps {
  placement: ConfettiPlacement;
}

const CONFETTI_BIT_CLASS_NAMES: Record<ConfettiPlacement, string[]> = {
  above: [
    "-left-[9px] -top-1.5 size-1.5 bg-positive-18",
    "left-1 -top-[15px] size-[5px] bg-secondary-11 [animation-delay:1.7s] [animation-duration:6.5s]",
    "left-[22px] -top-[13px] size-1.5 bg-positive-11 [animation-delay:3.1s] [animation-duration:5.5s]",
    "-left-3.5 top-3 size-1 bg-positive-11 [animation-delay:4.3s] [animation-duration:7s]",
  ],
  left: [
    "-left-[11px] top-1 size-1.5 bg-positive-18",
    "-left-[18px] top-[15px] size-[5px] bg-secondary-11 [animation-delay:1.7s] [animation-duration:6.5s]",
    "-left-[10px] top-[27px] size-1.5 bg-positive-11 [animation-delay:3.1s] [animation-duration:5.5s]",
    "-left-[17px] top-[35px] size-1 bg-positive-11 [animation-delay:4.3s] [animation-duration:7s]",
  ],
};

const RewardsCoinConfetti: FC<RewardsCoinConfettiProps> = ({ placement }) => (
  <span className="pointer-events-none absolute inset-0 rotate-12">
    {CONFETTI_BIT_CLASS_NAMES[placement].map(className => (
      <span key={className} className={`absolute rotate-45 motion-safe:animate-confetti-spark ${className}`} />
    ))}
  </span>
);

export default RewardsCoinConfetti;
