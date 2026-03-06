import { ANALYTICS_VERSION } from "constants/versions";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { compareVersions } from "compare-versions";
import { useMemo } from "react";
import { Abi } from "viem";
import { useReadContracts } from "wagmi";
import { useShallow } from "zustand/shallow";

interface UseTotalSpentOnProposalParams {
  contestAddress: `0x${string}`;
  chainId: number;
  userAddress?: `0x${string}`;
  proposalIds: string[];
}

interface SpentOnProposalResult {
  spentByProposal: Record<string, bigint>;
  totalSpentOnProposals: bigint;
  isAnalyticsSupported: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const buildContracts = (
  contestAddress: `0x${string}`,
  abi: Abi,
  chainId: number,
  userAddress: `0x${string}`,
  proposalIds: string[],
) => {
  return proposalIds.map(proposalId => ({
    address: contestAddress,
    abi,
    chainId,
    functionName: "getTotalSpentByAddressOnProposal" as const,
    args: [userAddress, BigInt(proposalId)],
  }));
};

const EMPTY_RESULT: SpentOnProposalResult = {
  spentByProposal: {},
  totalSpentOnProposals: 0n,
  isAnalyticsSupported: false,
  isLoading: false,
  isError: false,
  refetch: () => {},
};

//afaik we do not need this hook yet, we could prolly use it per entry p&l? let it sit here for future use though
const useTotalSpentOnProposal = ({
  contestAddress,
  chainId,
  userAddress,
  proposalIds,
}: UseTotalSpentOnProposalParams): SpentOnProposalResult => {
  const { abi, version } = useContestConfigStore(useShallow(state => state.contestConfig));
  const isAnalyticsSupported = !!version && compareVersions(version, ANALYTICS_VERSION) >= 0;

  const contracts = useMemo(() => {
    if (!isAnalyticsSupported || !userAddress || !proposalIds.length) return [];
    return buildContracts(contestAddress, abi, chainId, userAddress, proposalIds);
  }, [isAnalyticsSupported, contestAddress, abi, chainId, userAddress, proposalIds]);

  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: contracts as any,
    query: {
      enabled: isAnalyticsSupported && contracts.length > 0,
    },
  });

  const result = useMemo(() => {
    if (!data || !proposalIds.length) {
      return { spentByProposal: {} as Record<string, bigint>, totalSpentOnProposals: 0n };
    }

    const spentByProposal: Record<string, bigint> = {};
    let totalSpentOnProposals = 0n;

    for (let i = 0; i < proposalIds.length; i++) {
      const amount = (data[i]?.result as bigint) ?? 0n;
      spentByProposal[proposalIds[i]] = amount;
      totalSpentOnProposals += amount;
    }

    return { spentByProposal, totalSpentOnProposals };
  }, [data, proposalIds]);

  if (!isAnalyticsSupported) return EMPTY_RESULT;

  return {
    ...result,
    isAnalyticsSupported,
    isLoading,
    isError,
    refetch,
  };
};

export default useTotalSpentOnProposal;
