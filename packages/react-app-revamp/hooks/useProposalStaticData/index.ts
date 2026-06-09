import { useReadContracts } from "wagmi";
import { Abi } from "viem";
import { useMemo } from "react";

interface ProposalStaticData {
  description: string;
  author: string;
  exists: boolean;
  fieldsMetadata: {
    addressArray: string[];
    stringArray: string[];
    uintArray: bigint[];
  };
  isDeleted: boolean;
}

interface UseProposalStaticDataParams {
  address: `0x${string}`;
  proposalId: string;
  chainId: number;
  abi: Abi;
  enabled?: boolean;
}

interface UseProposalStaticDataResult {
  proposalStaticData: ProposalStaticData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const defaultMetadataFields = {
  addressArray: [],
  stringArray: [],
  uintArray: [],
};

export const useProposalStaticData = ({
  address,
  proposalId,
  chainId,
  abi,
  enabled = true,
}: UseProposalStaticDataParams): UseProposalStaticDataResult => {
  const contracts = useMemo(
    () => [
      {
        address,
        abi,
        chainId,
        functionName: "getProposal",
        args: [proposalId],
      },
      {
        address,
        abi,
        chainId,
        functionName: "proposalIsDeleted",
        args: [proposalId],
      },
    ],
    [address, abi, chainId, proposalId],
  );

  const { data, isLoading, isError, error } = useReadContracts({
    contracts,
    query: {
      enabled: enabled && !!address && !!abi && !!proposalId,
      staleTime: Infinity,
      select: data => {
        if (!data[0]?.result) {
          return null;
        }

        const proposalData = data[0].result as any;
        const isDeleted = (data[1]?.result ?? false) as boolean;

        const fieldsMetadata = proposalData.fieldsMetadata
          ? {
              addressArray: proposalData.fieldsMetadata.addressArray ?? defaultMetadataFields.addressArray,
              stringArray: proposalData.fieldsMetadata.stringArray ?? defaultMetadataFields.stringArray,
              uintArray: proposalData.fieldsMetadata.uintArray ?? defaultMetadataFields.uintArray,
            }
          : {
              addressArray: defaultMetadataFields.addressArray,
              uintArray: defaultMetadataFields.uintArray,
              stringArray: proposalData.description ? [proposalData.description] : [],
            };

        return {
          description: proposalData.description,
          author: proposalData.author,
          exists: proposalData.exists,
          fieldsMetadata,
          isDeleted,
        };
      },
    },
  });

  return {
    proposalStaticData: data ?? null,
    isLoading,
    isError,
    error: error as Error | null,
  };
};
