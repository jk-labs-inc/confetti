import { useAnimate, useReducedMotion } from "motion/react";
import { FC, useEffect } from "react";
import { COIN_FRAME_CLASS_NAMES } from "../../constants";
import { RewardsStickerSize } from "../../types";

interface RewardsCoinProps {
  size: RewardsStickerSize;
  isMuted: boolean;
  spinId: number | null;
}

const COIN_SPIN_DURATION_S = 0.7;
const COIN_SPIN_LIFT_PX = 6;
const COIN_SPIN_EASE = [0.2, 0.7, 0.2, 1] as const;
const SPARKLE_PATH = "M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z";

const COIN_SIZE_CLASS_NAMES: Record<RewardsStickerSize, { coin: string; rim: string; symbol: string; glint: string }> =
  {
    card: {
      coin: "shadow-[inset_0_-4px_0_var(--coin-edge),0_0_0_3px_#000]",
      rim: "inset-[5px] border-2",
      symbol: "-mt-[3px] text-[20px]",
      glint: "-right-[5px] -top-[7px] size-3.5",
    },
    stat: {
      coin: "shadow-[inset_0_-3px_0_var(--coin-edge),0_0_0_3px_#000]",
      rim: "inset-1 border-[1.5px]",
      symbol: "-mt-0.5 text-[16px]",
      glint: "-right-1 -top-1.5 size-3",
    },
    headline: {
      coin: "shadow-[inset_0_-5px_0_var(--coin-edge),0_0_0_3px_#000]",
      rim: "inset-[7px] border-2",
      symbol: "-mt-1 text-[28px]",
      glint: "-right-1.5 -top-2 size-4.5",
    },
  };

const GOLD_TONE_CLASS_NAMES = {
  coin: "bg-primary-10 text-true-black [--coin-edge:var(--color-primary-11)]",
  rim: "border-black/15",
};

const MUTED_TONE_CLASS_NAMES = {
  coin: "bg-neutral-7 text-neutral-9 [--coin-edge:var(--color-neutral-4)]",
  rim: "border-white/8",
};

const RewardsCoin: FC<RewardsCoinProps> = ({ size, isMuted, spinId }) => {
  const prefersReducedMotion = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLSpanElement>();

  useEffect(() => {
    if (spinId === null || prefersReducedMotion || !scope.current) return;

    animate(
      scope.current,
      { rotateY: [0, 360], y: [0, -COIN_SPIN_LIFT_PX, 0] },
      { duration: COIN_SPIN_DURATION_S, ease: COIN_SPIN_EASE },
    );
  }, [spinId, prefersReducedMotion, animate, scope]);

  const sizeClassNames = COIN_SIZE_CLASS_NAMES[size];
  const toneClassNames = isMuted ? MUTED_TONE_CLASS_NAMES : GOLD_TONE_CLASS_NAMES;

  return (
    <span
      aria-hidden="true"
      className={`relative z-1 block shrink-0 -rotate-12 perspective-[240px] ${COIN_FRAME_CLASS_NAMES[size]}`}
    >
      <span
        ref={scope}
        className={`relative flex size-full items-center justify-center rounded-full ${sizeClassNames.coin} ${toneClassNames.coin}`}
      >
        <span className={`absolute rounded-full ${sizeClassNames.rim} ${toneClassNames.rim}`} />
        <span className={`font-sabo-filled leading-none ${sizeClassNames.symbol}`}>$</span>
      </span>
      {!isMuted && (
        <svg
          viewBox="0 0 24 24"
          className={`absolute scale-0 fill-white motion-safe:animate-coin-glint ${sizeClassNames.glint}`}
        >
          <path d={SPARKLE_PATH} />
        </svg>
      )}
    </span>
  );
};

export default RewardsCoin;
