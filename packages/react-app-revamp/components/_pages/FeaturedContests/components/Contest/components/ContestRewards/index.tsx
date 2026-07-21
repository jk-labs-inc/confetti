import { formatBalance } from "@helpers/formatBalance";
import useTotalRewardsUsd, { TokenItem } from "@hooks/useCurrency/useTotalRewardsUsd";
import { ContestWithTotalRewards, ProcessedContest } from "lib/contests/types";
import { FC, useMemo } from "react";
import { isContestActive, isContestInEntryPeriod, isContestInVotingPeriod } from "../../helpers";

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
  const contestIsInEntryPeriod = isContestInEntryPeriod(contestData);
  const contestIsInVotingPeriod = isContestInVotingPeriod(contestData);
  const hasRewards = tokenItems.length > 0;

  if (isRewardsFetching && !rewardsData) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <span role="img" aria-label="money bag" className="text-base">
          💰
        </span>
        <div className="w-16 h-4 bg-neutral-5 rounded animate-pulse" />
      </div>
    );
  }

  if (!hasRewards) return null;

  return (
    <div className="flex items-baseline gap-1 shrink-0">
      <span role="img" aria-label="money bag" className="shrink-0 text-base">
        💰
      </span>
      <p className={`font-bold whitespace-nowrap ${contestIsActive ? "text-neutral-11" : "text-neutral-10"}`}>
        {totalUsd !== null ? (
          <>${totalUsd}</>
        ) : (
          <>
            {formatBalance(tokenItems[0].value)} <span className="uppercase">${tokenItems[0].symbol}</span>
          </>
        )}
        {contestIsInEntryPeriod && <sup>+</sup>}
        {contestIsInVotingPeriod && <span className="font-normal text-[0.75em]"> (and climbing)</span>}
      </p>
    </div>
  );
};

export default ContestRewards;
