import { formatBalance } from "@helpers/formatBalance";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import useTotalRewardsUsd, { TokenItem } from "@hooks/useCurrency/useTotalRewardsUsd";
import { useTotalRewards } from "@hooks/useTotalRewards";
import { ModuleType, RewardsModuleInfo } from "lib/rewards/types";
import { AnimatePresence, motion } from "motion/react";
import { FC, useEffect, useMemo, useState } from "react";
import { Abi } from "viem";

interface RewardsDisplayProps {
  rewards: RewardsModuleInfo;
  rewardsModuleAddress: `0x${string}`;
  rewardsAbi: Abi;
  chainId: number;
  chainName: string;
  isRewardsModuleLoading: boolean;
  isRewardsModuleError: boolean;
}

const RewardsDisplay: FC<RewardsDisplayProps> = ({
  rewards,
  rewardsModuleAddress,
  rewardsAbi,
  chainId,
  chainName,
  isRewardsModuleLoading,
  isRewardsModuleError,
}) => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);

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

  const tokenItems: TokenItem[] = useMemo(() => {
    const items: TokenItem[] = [];

    if (totalRewards?.native && totalRewards.native.value > 0n) {
      items.push({
        value: totalRewards.native.formatted,
        symbol: totalRewards.native.symbol,
      });
    }

    if (totalRewards?.tokens) {
      Object.entries(totalRewards.tokens).forEach(([address, tokenData]) => {
        if (tokenData.value > 0n) {
          items.push({
            value: tokenData.formatted,
            symbol: tokenData.symbol,
            tokenAddress: address,
          });
        }
      });
    }

    return items;
  }, [totalRewards]);

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
      <span className="text-[24px]">💰</span>
      {displayCurrency === "usd" && totalUsd !== null ? (
        <p className="text-neutral-11 text-[16px] md:text-[24px]">${totalUsd}</p>
      ) : currentReward ? (
        <AnimatePresence mode="wait">
          <motion.p
            key={`reward-${currentIndex}`}
            className="text-neutral-11 text-[16px] md:text-[24px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.5 }}
            style={{ willChange: "transform, opacity" }}
          >
            {formatBalance(currentReward.value)}{" "}
            <span className="text-[16px] uppercase">${currentReward.symbol}</span>
          </motion.p>
        </AnimatePresence>
      ) : null}
      <p className="text-[16px] text-neutral-11">
        to <b>{rewards?.moduleType === ModuleType.VOTER_REWARDS ? "voters" : "entrants"}</b>
      </p>
    </div>
  );
};

export default RewardsDisplay;
