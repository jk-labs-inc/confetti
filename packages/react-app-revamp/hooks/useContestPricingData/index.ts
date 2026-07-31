import { CREATOR_SPLIT_VERSION } from "@hooks/useContest/v3v4/contracts";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { PriceCurveType } from "@hooks/useDeployContest/types";
import usePriceCurveMultiple from "@hooks/usePriceCurveMultiple";
import usePriceCurveType from "@hooks/usePriceCurveType";
import { compareVersions } from "compare-versions";
import { useReadContract } from "wagmi";

interface ContestPricingData {
  percentageToRewards: number;
  costToVote: bigint;
  multiple: number;
  priceCurveType: PriceCurveType;
  isLoading: boolean;
  isError: boolean;
}

export const useContestPricingData = (): ContestPricingData => {
  const { contestConfig } = useContestConfigStore(state => state);
  const hasCreatorSplit = contestConfig.version
    ? compareVersions(contestConfig.version, CREATOR_SPLIT_VERSION) >= 0
    : false;
  const percentageFunctionName = hasCreatorSplit ? "percentageToRewards" : "percentageToCreator";

  const {
    data: percentageToRewardsRaw,
    isLoading: isLoadingPercentage,
    isError: isErrorPercentage,
  } = useReadContract({
    address: contestConfig.address as `0x${string}`,
    abi: contestConfig.abi,
    functionName: percentageFunctionName,
    chainId: contestConfig.chainId,
    query: {
      enabled: Boolean(contestConfig.address && contestConfig.abi && contestConfig.chainId),
      staleTime: Infinity,
    },
  });

  const {
    data: costToVoteRaw,
    isLoading: isLoadingCost,
    isError: isErrorCost,
  } = useReadContract({
    address: contestConfig.address as `0x${string}`,
    abi: contestConfig.abi,
    functionName: "costToVote",
    chainId: contestConfig.chainId,
    query: {
      enabled: Boolean(contestConfig.address && contestConfig.abi && contestConfig.chainId),
      staleTime: Infinity,
    },
  });

  const {
    priceCurveMultiple,
    isLoading: isLoadingMultiple,
    isError: isErrorMultiple,
  } = usePriceCurveMultiple({
    address: contestConfig.address as `0x${string}`,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    enabled: Boolean(contestConfig.address && contestConfig.abi && contestConfig.chainId),
  });

  const { priceCurveType } = usePriceCurveType({
    address: contestConfig.address as `0x${string}`,
    abi: contestConfig.abi,
    chainId: contestConfig.chainId,
    version: contestConfig.version,
    enabled: Boolean(contestConfig.address && contestConfig.abi && contestConfig.chainId),
  });

  return {
    percentageToRewards: percentageToRewardsRaw ? Number(percentageToRewardsRaw) : 0,
    costToVote: (costToVoteRaw as bigint) || 0n,
    multiple: priceCurveMultiple ? Number(priceCurveMultiple) : 0,
    priceCurveType,
    isLoading: isLoadingPercentage || isLoadingCost || isLoadingMultiple,
    isError: isErrorPercentage || isErrorCost || isErrorMultiple,
  };
};
