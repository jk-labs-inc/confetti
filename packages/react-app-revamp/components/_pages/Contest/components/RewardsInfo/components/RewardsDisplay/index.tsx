import { formatBalance } from "@helpers/formatBalance";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import { ContestStatus, useContestStatusStore } from "@hooks/useContestStatus/store";
import useTotalRewardsUsd, { toRewardTokenItems } from "@hooks/useCurrency/useTotalRewardsUsd";
import { useTotalRewards } from "@hooks/useTotalRewards";
import { ModuleType, RewardsModuleInfo } from "lib/rewards/types";
import { AnimatePresence, motion } from "motion/react";
import { FC, useEffect, useMemo, useState } from "react";
import { Abi } from "viem";

export type RewardsInfoVariant = "stat" | "headline";

interface RewardsDisplayProps {
  variant?: RewardsInfoVariant;
  rewards: RewardsModuleInfo;
  rewardsModuleAddress: `0x${string}`;
  rewardsAbi: Abi;
  chainId: number;
  chainName: string;
  isRewardsModuleLoading: boolean;
  isRewardsModuleError: boolean;
}

const VARIANT_CLASS_NAMES: Record<RewardsInfoVariant, { emoji: string; amount: string; label: string }> = {
  stat: {
    emoji: "text-[24px]",
    amount: "text-neutral-11 text-[16px] md:text-[24px] font-bold md:font-normal",
    label: "text-[16px] text-neutral-11",
  },
  headline: {
    emoji: "text-[22px] wide:text-[24px]",
    amount: "text-neutral-11 text-[22px] wide:text-[24px] font-bold",
    label: "text-[15px] wide:text-[16px] text-neutral-11",
  },
};

const RewardsDisplay: FC<RewardsDisplayProps> = ({
  variant = "stat",
  rewards,
  rewardsModuleAddress,
  rewardsAbi,
  chainId,
  chainName,
  isRewardsModuleLoading,
  isRewardsModuleError,
}) => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);
  const isVotingClosed = useContestStatusStore(state => state.contestStatus) === ContestStatus.VotingClosed;
  const classNames = VARIANT_CLASS_NAMES[variant];

  const {
    data: totalRewards,
    isLoading: isTotalRewardsLoading,
    isError: isTotalRewardsError,
  } = useTotalRewards({
    rewardsModuleAddress: rewardsModuleAddress,
    rewardsModuleAbi: rewardsAbi,
    chainId,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const tokenItems = useMemo(() => toRewardTokenItems(totalRewards), [totalRewards]);

  const totalUsd = useTotalRewardsUsd(tokenItems, chainName);
  const hasRewards = tokenItems.length > 0;
  const currentReward = tokenItems[currentIndex];

  // Cycle through tokens when in native mode and there are multiple
  useEffect(() => {
    if (displayCurrency === "native" && tokenItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % tokenItems.length);
      }, 2000);

      return () => clearInterval(interval);
    }

    setCurrentIndex(0);
  }, [displayCurrency, tokenItems.length]);

  if (isRewardsModuleLoading || isRewardsModuleError || !hasRewards || isTotalRewardsLoading || isTotalRewardsError)
    return null;

  return (
    <div className="flex items-baseline gap-1">
      <span className={classNames.emoji}>💰</span>
      {displayCurrency === "usd" && totalUsd !== null ? (
        <p className={classNames.amount}>${totalUsd}</p>
      ) : currentReward ? (
        <AnimatePresence mode="wait">
          <motion.p
            key={`reward-${currentIndex}`}
            className={classNames.amount}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.5 }}
            style={{ willChange: "transform, opacity" }}
          >
            {formatBalance(currentReward.value)}{" "}
            <span className={`${classNames.label} uppercase`}>${currentReward.symbol}</span>
          </motion.p>
        </AnimatePresence>
      ) : null}
      <p className={classNames.label}>
        {isVotingClosed ? "paid to" : "to"}{" "}
        <b>{rewards?.moduleType === ModuleType.VOTER_REWARDS ? "voters" : "entrants"}</b>
      </p>
    </div>
  );
};

export default RewardsDisplay;
