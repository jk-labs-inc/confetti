import { formatBalance } from "@helpers/formatBalance";
import { useCurrencyStore } from "@hooks/useCurrency/store";
import useTotalRewardsUsd, { TokenItem } from "@hooks/useCurrency/useTotalRewardsUsd";
import { ContestWithTotalRewards } from "lib/contests/types";
import { AnimatePresence, motion } from "motion/react";
import { FC, useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";

interface ContestRewardsProps {
  rewards: ContestWithTotalRewards;
  loading: boolean;
  rewardsLoading: boolean;
}

const ContestRewards: FC<ContestRewardsProps> = ({ rewards, loading, rewardsLoading }) => {
  const displayCurrency = useCurrencyStore(state => state.displayCurrency);

  const tokenItems: TokenItem[] = useMemo(() => {
    if (!rewards?.hasRewards || !rewards.rewardsData) return [];

    const items: TokenItem[] = [];
    const { native, tokens } = rewards.rewardsData;

    if (native && native.value > 0n) {
      items.push({ value: native.formatted, symbol: native.symbol });
    }

    if (tokens) {
      Object.entries(tokens).forEach(([address, tokenData]) => {
        if (tokenData.value > 0n) {
          items.push({ value: tokenData.formatted, symbol: tokenData.symbol, tokenAddress: address });
        }
      });
    }

    return items;
  }, [rewards]);

  const totalUsd = useTotalRewardsUsd(tokenItems, rewards.chain);
  const hasRewards = tokenItems.length > 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentReward = tokenItems[currentIndex];

  useEffect(() => {
    if (displayCurrency === "native" && tokenItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % tokenItems.length);
      }, 2000);

      return () => clearInterval(interval);
    }

    setCurrentIndex(0);
  }, [displayCurrency, tokenItems.length]);

  return (
    <div className="flex flex-col">
      {rewardsLoading || loading ? (
        <Skeleton />
      ) : hasRewards ? (
        <div className="flex flex-col">
          <div className="font-bold w-full text-neutral-11">
            {displayCurrency === "usd" && totalUsd !== null ? (
              `$${totalUsd}`
            ) : currentReward ? (
              <AnimatePresence mode="wait">
                <motion.span
                  key={`reward-${currentIndex}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30, duration: 0.4 }}
                  style={{ willChange: "transform, opacity" }}
                >
                  {formatBalance(currentReward.value)} <span className="uppercase">${currentReward.symbol}</span>
                </motion.span>
              </AnimatePresence>
            ) : null}
          </div>
          <p className="text-[16px] text-neutral-9">in rewards</p>
        </div>
      ) : null}
    </div>
  );
};

export default ContestRewards;
