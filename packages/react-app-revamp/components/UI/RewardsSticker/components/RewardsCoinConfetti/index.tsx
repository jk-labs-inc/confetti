import { FC } from "react";

type ConfettiPlacement = "above" | "left";

interface RewardsCoinConfettiProps {
  placement: ConfettiPlacement;
}

interface ConfettiBit {
  className: string;
  delayS: number;
  durationS: number;
}

const CONFETTI_BITS: Record<ConfettiPlacement, ConfettiBit[]> = {
  above: [
    { className: "-left-[9px] -top-1.5 size-1.5 bg-positive-18", delayS: 0, durationS: 5 },
    { className: "left-1 -top-[15px] size-[5px] bg-secondary-11", delayS: 1.7, durationS: 6.5 },
    { className: "left-[22px] -top-[13px] size-1.5 bg-positive-11", delayS: 3.1, durationS: 5.5 },
    { className: "-left-3.5 top-3 size-1 bg-positive-11", delayS: 4.3, durationS: 7 },
  ],
  left: [
    { className: "-left-[11px] top-1 size-1.5 bg-positive-18", delayS: 0, durationS: 5 },
    { className: "-left-[18px] top-[15px] size-[5px] bg-secondary-11", delayS: 1.7, durationS: 6.5 },
    { className: "-left-[10px] top-[27px] size-1.5 bg-positive-11", delayS: 3.1, durationS: 5.5 },
    { className: "-left-[17px] top-[35px] size-1 bg-positive-11", delayS: 4.3, durationS: 7 },
  ],
};

const RewardsCoinConfetti: FC<RewardsCoinConfettiProps> = ({ placement }) => (
  <span className="pointer-events-none absolute inset-0 rotate-12">
    {CONFETTI_BITS[placement].map(({ className, delayS, durationS }) => (
      <span
        key={className}
        className={`absolute rotate-45 motion-safe:animate-confetti-spark ${className}`}
        style={{ animationDelay: `${delayS}s`, animationDuration: `${durationS}s` }}
      />
    ))}
  </span>
);

export default RewardsCoinConfetti;
