import { formatTokenAmountSmart, formatUsd } from "@helpers/formatBalance";
import usePotDisplayCurrency from "@hooks/useCurrency/usePotDisplayCurrency";
import { useRewardsUsd } from "@hooks/useCurrency/useTotalRewardsUsd";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { FC, useEffect, useRef, useState } from "react";
import RewardsCoin from "./components/RewardsCoin";
import RewardsStickerSkeleton from "./components/RewardsStickerSkeleton";
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
    label: "text-[11px]",
    pop: "-left-12 -top-1.5",
  },
  stat: {
    body: "gap-1.5 pl-3.5 pr-2.5 py-1 rounded-xl",
    amount: "text-[18px]",
    label: "text-[11px]",
    pop: "-right-3 -top-5",
  },
  headline: {
    body: "gap-2.5 pl-6 pr-4 py-2 rounded-2xl",
    amount: "text-[26px]",
    label: "text-[13px]",
    pop: "-right-5 -top-6",
  },
  hero: {
    body: "gap-3 pl-7 pr-5 py-2.5 rounded-[20px]",
    amount: "text-[32px]",
    label: "text-[15px]",
    pop: "-right-5 -top-7",
  },
};

const TONE_CLASS_NAMES: Record<RewardsPhase, string> = {
  upcoming: "bg-primary-10 text-true-black",
  live: "bg-primary-10 text-true-black",
  ended: "bg-neutral-5 text-neutral-9",
};

const SHORT_LABELS: Record<RewardsPhase, string> = {
  upcoming: "in rewards",
  live: "in rewards",
  ended: "paid out",
};

const WIN_LABEL_LINES: Record<RewardsAudience, [string, string]> = {
  voters: ["for voting", "on the winner"],
  entrants: ["for entrants", "to win"],
};

const LONG_LABEL_LINES: Record<RewardsPhase, (audience: RewardsAudience) => [string, string]> = {
  upcoming: audience => WIN_LABEL_LINES[audience],
  live: audience => WIN_LABEL_LINES[audience],
  ended: audience => ["paid to", audience],
};

const RewardsSticker: FC<RewardsStickerProps> = props => {
  const { items, chainName, phase, size } = props;
  const displayCurrency = usePotDisplayCurrency(chainName, items);
  const { totalUsd, increase, isRatesLoading } = useRewardsUsd({ items, chainName });
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
  if (displayCurrency === "usd" && isRatesLoading) return <RewardsStickerSkeleton size={size} />;

  const sizeClassNames = SIZE_CLASS_NAMES[size];
  const plusSuffix = phase === "upcoming" ? "+" : "";
  const amountText =
    usdAmount !== null
      ? `$${usdAmount}${plusSuffix}`
      : `${formatTokenAmountSmart(token.value)} $${token.symbol.toUpperCase()}${plusSuffix}`;

  return (
    <span className="relative inline-flex shrink-0">
      <span className={`flex items-center ${STICKER_TILT_CLASS_NAMES[size]}`}>
        <RewardsCoin size={size} isMuted={phase === "ended"} spinId={pop?.id ?? null} />
        <span
          ref={scope}
          className={`flex items-center whitespace-nowrap ${sizeClassNames.body} ${TONE_CLASS_NAMES[phase]} ${STICKER_RING_CLASS_NAME}`}
        >
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
          {props.size === "headline" || props.size === "hero" ? (
            <span className={`flex flex-col font-black leading-[1.1] ${sizeClassNames.label}`}>
              {LONG_LABEL_LINES[phase](props.audience).map(line => (
                <span key={line}>{line}</span>
              ))}
            </span>
          ) : (
            <span className={`font-black ${sizeClassNames.label}`}>{SHORT_LABELS[phase]}</span>
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
