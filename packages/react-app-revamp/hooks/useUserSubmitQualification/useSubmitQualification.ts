import { useMemo } from "react";
import { Abi } from "viem";
import { useReadContracts } from "wagmi";

export interface UseSubmitQualificationParams {
  address: `0x${string}`;
  chainId: number;
  abi: Abi;
  userAddress: `0x${string}` | undefined;
  enabled?: boolean;
}

export interface UseSubmitQualificationResult {
  qualifies: boolean;
  anyoneCanSubmit: boolean;
  isLoading: boolean;
  isError: boolean;
}

export const useSubmitQualification = ({
  address,
  chainId,
  abi,
  userAddress,
  enabled = true,
}: UseSubmitQualificationParams): UseSubmitQualificationResult => {
  const contracts = useMemo(
    () => [
      {
        address,
        abi,
        chainId,
        functionName: "anyoneCanSubmit",
      },
      {
        address,
        abi,
        chainId,
        functionName: "creator",
      },
    ],
    [address, abi, chainId],
  );

  const { data, isLoading, isError } = useReadContracts({
    contracts,
    query: {
      enabled: enabled && !!address && !!abi,
      staleTime: Infinity,
      select: data => {
        if (data[0]?.result === undefined || !data[1]?.result) {
          return null;
        }

        const anyoneCanSubmit = Number(data[0].result) === 1;
        const creator = data[1].result as `0x${string}`;

        return { anyoneCanSubmit, creator };
      },
    },
  });

  const anyoneCanSubmit = data?.anyoneCanSubmit ?? false;
  const qualifies = userAddress ? anyoneCanSubmit || userAddress === data?.creator : false;

  return {
    qualifies,
    anyoneCanSubmit,
    isLoading,
    isError,
  };
};
