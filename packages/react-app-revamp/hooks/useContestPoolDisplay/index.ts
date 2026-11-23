import { formatBalance } from "@helpers/formatBalance";
import { useCancelRewards } from "@hooks/useCancelRewards";
import useContestConfigStore from "@hooks/useContestConfig/store";
import usePotDisplayCurrency from "@hooks/useCurrency/usePotDisplayCurrency";
import useTotalRewardsUsd from "@hooks/useCurrency/useTotalRewardsUsd";
import { toRewardTokenItems } from "lib/rewards/valuation";
import useRewardsModule from "@hooks/useRewards";
import { useTotalRewards } from "@hooks/useTotalRewards";
import { ModuleType } from "lib/rewards/types";
import { useMemo } from "react";
import { Abi } from "viem";
import { useShallow } from "zustand/shallow";

export type PoolRecipientsLabel = "voters" | "entrants";

export interface ContestPoolDisplay {
  amountLabel: string | null;
  recipientsLabel: PoolRecipientsLabel;
  hasRewards: boolean;
  isLoading: boolean;
}

export const useContestPoolDisplay = (): ContestPoolDisplay => {
  const { chainId, chainName, version } = useContestConfigStore(
    useShallow(state => ({
      chainId: state.contestConfig.chainId,
      chainName: state.contestConfig.chainName,
      version: state.contestConfig.version,
    })),
  );
  const { data: rewards, isLoading: isRewardsLoading, isSuccess: isRewardsSuccess, isError } = useRewardsModule();
  const {
    isCanceled,
    isLoading: isCancelLoading,
    isError: isCancelError,
  } = useCancelRewards({
    rewardsAddress: rewards?.contractAddress as `0x${string}`,
    abi: rewards?.abi as Abi,
    chainId,
    version,
  });
  const hasValidModule =
    isRewardsSuccess && !!rewards && !rewards.isBytecodeInvalid && !isCanceled && !isError && !isCancelError;

  const {
    data: totalRewards,
    isLoading: isTotalRewardsLoading,
    isError: isTotalRewardsError,
  } = useTotalRewards({
    rewardsModuleAddress: rewards?.contractAddress as `0x${string}`,
    rewardsModuleAbi: rewards?.abi as Abi,
    chainId,
    enabled: hasValidModule,
  });

  const tokenItems = useMemo(() => toRewardTokenItems(totalRewards), [totalRewards]);
  const displayCurrency = usePotDisplayCurrency(chainName, tokenItems);

  const totalUsd = useTotalRewardsUsd(tokenItems, chainName);
  const hasRewards = hasValidModule && !isTotalRewardsError && tokenItems.length > 0;
  const firstToken = tokenItems[0];
  const amountLabel = !hasRewards
    ? null
    : displayCurrency === "usd" && totalUsd !== null
      ? `$${totalUsd}`
      : `${formatBalance(firstToken.value)} $${firstToken.symbol.toUpperCase()}`;

  return {
    amountLabel,
    recipientsLabel: rewards?.moduleType === ModuleType.VOTER_REWARDS ? "voters" : "entrants",
    hasRewards,
    isLoading: isRewardsLoading || isCancelLoading || (hasValidModule && isTotalRewardsLoading),
  };
};

export default useContestPoolDisplay;
