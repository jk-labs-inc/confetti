import { formatBalance } from "@helpers/formatBalance";
import useTotalRewardsUsd, { TokenItem } from "@hooks/useCurrency/useTotalRewardsUsd";
import { ContestWithTotalRewards, ProcessedContest } from "lib/contests/types";
import { FC, useMemo } from "react";
import { isContestActive } from "../../helpers";

interface ContestRewardsProps {
  contestData: ProcessedContest;
  rewardsData?: ContestWithTotalRewards | null;
  isRewardsFetching: boolean;
}

const ContestRewards: FC<ContestRewardsProps> = ({ contestData, rewardsData, isRewardsFetching }) => {
  const tokenItems: TokenItem[] = useMemo(() => {
    if (!rewardsData?.hasRewards || !rewardsData.rewardsData) return [];

    const items: TokenItem[] = [];
    const { native, tokens } = rewardsData.rewardsData;

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
  }, [rewardsData]);

  const totalUsd = useTotalRewardsUsd(tokenItems, rewardsData?.chain ?? "");
  const contestIsActive = isContestActive(contestData);
  const hasRewards = tokenItems.length > 0;

  if (isRewardsFetching) {
    return (
      <div className="flex items-center gap-1">
        <span role="img" aria-label="money bag">
          💰
        </span>
        <div className="w-16 h-4 bg-neutral-5 rounded animate-pulse" />
      </div>
    );
  }

  if (!hasRewards) return null;

  return (
    <div className="flex items-center gap-1">
      <span role="img" aria-label="money bag" className="shrink-0">
        💰
      </span>
      <p
        className={`text-xs font-bold whitespace-nowrap ${contestIsActive ? "text-neutral-11" : "text-neutral-9"}`}
      >
        {totalUsd !== null ? (
          <>
            ${totalUsd}
            {contestIsActive && <span className="inline-block -translate-y-0.5 ml-1">🚀</span>}
          </>
        ) : (
          <>
            {formatBalance(tokenItems[0].value)} <span className="uppercase">${tokenItems[0].symbol}</span>
            {contestIsActive && <span className="inline-block -translate-y-0.5 ml-1">🚀</span>}
          </>
        )}
      </p>
    </div>
  );
};

export default ContestRewards;
