import { formatBalance } from "@helpers/formatBalance";
import useTotalRewardsUsd, { TokenItem } from "@hooks/useCurrency/useTotalRewardsUsd";
import { ContestWithTotalRewards } from "lib/contests/types";
import { FC, useMemo } from "react";
import Skeleton from "react-loading-skeleton";

interface ContestRewardsProps {
  rewards: ContestWithTotalRewards;
  loading: boolean;
  rewardsLoading: boolean;
}

const ContestRewards: FC<ContestRewardsProps> = ({ rewards, loading, rewardsLoading }) => {
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

  return (
    <div className="flex flex-col">
      {rewardsLoading || loading ? (
        <Skeleton />
      ) : hasRewards ? (
        <div className="flex flex-col">
          <p className="font-bold w-full text-neutral-11">
            {totalUsd !== null ? (
              `$${totalUsd}`
            ) : (
              <>
                {formatBalance(tokenItems[0].value)} <span className="uppercase">{tokenItems[0].symbol}</span>
              </>
            )}
          </p>
          <p className="text-[16px] text-neutral-9">in rewards</p>
        </div>
      ) : null}
    </div>
  );
};

export default ContestRewards;
