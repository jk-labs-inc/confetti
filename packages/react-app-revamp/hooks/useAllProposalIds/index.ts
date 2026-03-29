import { useReadContract, useReadContracts } from "wagmi";
import { Abi } from "viem";
import { useMemo } from "react";

interface UseAllProposalIdsParams {
  address: `0x${string}`;
  chainId: number;
  abi: Abi;
  version: string;
  enabled?: boolean;
}

interface UseAllProposalIdsResult {
  allProposalIds: string[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Client-side hook to fetch all proposal IDs
 */
export const useAllProposalIds = ({
  address,
  chainId,
  abi,
  version,
  enabled = true,
}: UseAllProposalIdsParams): UseAllProposalIdsResult => {
  const isLegacy = useMemo(() => !version || version.startsWith("3."), [version]);

  // For legacy contracts, use getAllProposalIds
  const {
    data: legacyData,
    isLoading: legacyLoading,
    isError: legacyError,
    error: legacyErrorObj,
  } = useReadContract({
    address,
    abi,
    chainId,
    functionName: "getAllProposalIds",
    query: {
      enabled: enabled && isLegacy && !!address && !!abi,
      staleTime: Infinity,
      select: (data: any) => {
        const proposalIds = data as bigint[];
        return proposalIds.map(id => id.toString());
      },
    },
  });

  // For non-legacy contracts, use allProposalTotalVotes and getAllDeletedProposalIds
  const nonLegacyContracts = useMemo(
    () => [
      {
        address,
        abi,
        chainId,
        functionName: "allProposalTotalVotes",
      },
      {
        address,
        abi,
        chainId,
        functionName: "getAllDeletedProposalIds",
      },
    ],
    [address, abi, chainId],
  );

  const {
    data: nonLegacyData,
    isLoading: nonLegacyLoading,
    isError: nonLegacyError,
    error: nonLegacyErrorObj,
  } = useReadContracts({
    contracts: nonLegacyContracts,
    query: {
      enabled: enabled && !isLegacy && !!address && !!abi,
      staleTime: Infinity,
      select: data => {
        if (!data[0]?.result) {
          return [];
        }

        const allProposalsResult = data[0].result as any;
        const proposalIds = allProposalsResult[0] as bigint[];
        const deletedIdsArray = data[1]?.result as bigint[] | undefined;

        const deletedProposalSet = new Set(deletedIdsArray ? deletedIdsArray.map((id: bigint) => id.toString()) : []);

        return proposalIds
          .map((id: bigint) => id.toString())
          .filter((id: string) => !deletedProposalSet.has(id));
      },
    },
  });

  if (isLegacy) {
    return {
      allProposalIds: legacyData ?? [],
      isLoading: legacyLoading,
      isError: legacyError,
      error: legacyErrorObj as Error | null,
    };
  }

  return {
    allProposalIds: nonLegacyData ?? [],
    isLoading: nonLegacyLoading,
    isError: nonLegacyError,
    error: nonLegacyErrorObj as Error | null,
  };
};
