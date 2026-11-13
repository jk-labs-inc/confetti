import { formatTokenAmountSmart, formatUsd } from "@helpers/formatBalance";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import { useRewardsUsd } from "@hooks/useCurrency/useTotalRewardsUsd";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { FC, useEffect, useRef, useState } from "react";
import RewardsCoin from "./components/RewardsCoin";
import { STICKER_RING_CLASS_NAME, STICKER_TILT_CLASS_NAMES } from "./constants";
import { RewardsAudience, RewardsPhase } from "lib/rewards/types";
import { RewardsStickerProps, RewardsStickerSize } from "./types";

const TOKEN_CYCLE_INTERVAL_MS = 2000;
const POP_DURATION_S = 1.5;
const BUMP_DURATION_S = 0.45;

const SIZE_CLASS_NAMES: Record<RewardsStickerSize, { body: string; amount: string; label: string; pop: string }> = {
  card: {
    body: "gap-1 pl-4 pr-2.5 py-[5px] rounded-[10px]",
    amount: "text-[17px]",
    label: "text-[11px] font-black",
    pop: "-left-12 -top-1.5",
  },
  stat: {
    body: "gap-1.5 pl-3.5 pr-2.5 py-1 rounded-xl",
    amount: "text-[18px]",
    label: "text-[11px] font-black",
    pop: "-right-3 -top-5",
  },
  headline: {
    body: "gap-2.5 pl-2.5",
    amount: "text-[22px]",
    label: "text-[13px] font-bold",
    pop: "-right-5 -top-6",
  },
  bar: {
    body: "gap-[7px] pl-2",
    amount: "text-[19px]",
    label: "text-[13px] font-bold",
    pop: "-right-3 -top-5",
  },
};

const STICKER_TONE_CLASS_NAMES: Record<RewardsPhase, string> = {
  upcoming: `bg-primary-10 text-true-black ${STICKER_RING_CLASS_NAME}`,
  live: `bg-primary-10 text-true-black ${STICKER_RING_CLASS_NAME}`,
  ended: `bg-neutral-5 text-neutral-9 ${STICKER_RING_CLASS_NAME}`,
};

const INLINE_TONE_CLASS_NAMES: Record<RewardsPhase, { body: string; label: string }> = {
  upcoming: { body: "text-primary-10", label: "text-neutral-12" },
  live: { body: "text-primary-10", label: "text-neutral-12" },
  ended: { body: "text-neutral-9", label: "" },
};

const SHORT_LABELS: Record<RewardsPhase, string> = {
  upcoming: "to win",
  live: "to win",
  ended: "paid out",
};

const LONG_LABELS: Record<RewardsPhase, (audience: RewardsAudience) => string> = {
  upcoming: audience => `for ${audience} to win`,
  live: audience => `for ${audience} to win`,
  ended: audience => `paid to ${audience}`,
};

const RewardsSticker: FC<RewardsStickerProps> = props => {
  const { items, chainName, phase, size } = props;
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const { totalUsd, increase } = useRewardsUsd({ items, chainName });
  const prefersReducedMotion = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const [tokenIndex, setTokenIndex] = useState(0);
  const [pop, setPop] = useState<typeof increase>(null);
  const seenIncreaseIdRef = useRef(0);

  const usdAmount = displayCurrency === "usd" ? totalUsd : null;
  const cyclesTokens = usdAmount === null && items.length > 1;

  useEffect(() => {
    setTokenIndex(0);
    if (!cyclesTokens) return;

    const interval = setInterval(() => setTokenIndex(index => (index + 1) % items.length), TOKEN_CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [cyclesTokens, items.length]);

  useEffect(() => {
    if (!increase || increase.id === seenIncreaseIdRef.current) return;
    seenIncreaseIdRef.current = increase.id;
    if (usdAmount === null || phase === "ended") return;

    setPop(increase);
    if (prefersReducedMotion || !scope.current) return;

    animate(scope.current, { scale: [1, 1.12, 1] }, { duration: BUMP_DURATION_S, ease: "easeOut" });
  }, [increase, usdAmount, phase, prefersReducedMotion, animate, scope]);

  const token = items[tokenIndex] ?? items[0];
  if (!token) return null;

  const sizeClassNames = SIZE_CLASS_NAMES[size];
  const bodyToneClassName =
    size === "headline" || size === "bar" ? INLINE_TONE_CLASS_NAMES[phase].body : STICKER_TONE_CLASS_NAMES[phase];
  const plusSuffix = phase === "upcoming" ? "+" : "";
  const amountText =
    usdAmount !== null
      ? `$${usdAmount}${plusSuffix}`
      : `${formatTokenAmountSmart(token.value)} $${token.symbol.toUpperCase()}${plusSuffix}`;

  return (
    <span className="relative inline-flex shrink-0">
      <span className={`flex items-center ${STICKER_TILT_CLASS_NAMES[size]}`}>
        <RewardsCoin size={size} isMuted={phase === "ended"} spinId={pop?.id ?? null} />
        <span ref={scope} className={`flex items-center whitespace-nowrap ${sizeClassNames.body} ${bodyToneClassName}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={usdAmount !== null ? "usd" : `token-${tokenIndex}`}
              className={`font-sabo-filled leading-none ${sizeClassNames.amount}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {amountText}
            </motion.span>
          </AnimatePresence>
          {props.size === "headline" || props.size === "bar" ? (
            <span className={`${sizeClassNames.label} ${INLINE_TONE_CLASS_NAMES[phase].label}`}>
              {props.size === "bar" && <span className="min-[414px]:hidden">{SHORT_LABELS[phase]}</span>}
              <span className={props.size === "bar" ? "max-[413px]:hidden" : undefined}>
                {LONG_LABELS[phase](props.audience)}
              </span>
            </span>
          ) : (
            <span className={sizeClassNames.label}>{SHORT_LABELS[phase]}</span>
          )}
        </span>
      </span>
      {pop && (
        <motion.span
          key={pop.id}
          aria-hidden="true"
          className={`pointer-events-none absolute whitespace-nowrap rounded-full bg-positive-11 px-2 py-0.5 text-[12px] font-black text-true-black ${sizeClassNames.pop}`}
          initial={{ opacity: 0 }}
          animate={
            prefersReducedMotion
              ? { opacity: [0, 1, 1, 0] }
              : { opacity: [0, 1, 1, 0], y: [8, 0, -6, -14], scale: [0.7, 1.08, 1, 1] }
          }
          transition={{ duration: POP_DURATION_S, times: [0, 0.18, 0.7, 1], ease: "easeOut" }}
          onAnimationComplete={() => setPop(null)}
        >
          +${formatUsd(pop.amountUsd)}
        </motion.span>
      )}
    </span>
  );
};

export default RewardsSticker;
