import { PriceCurveType } from "@hooks/useDeployContest/types";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { Abi, ReadContractErrorType } from "viem";
import { useReadContract } from "wagmi";

interface PriceCurveTypeParams {
  address: string;
  abi: Abi;
  chainId: number;
  enabled?: boolean;
}

interface PriceCurveTypeResponse {
  priceCurveType: PriceCurveType;
  isLoading: boolean;
  isError: boolean;
  refetch: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<PriceCurveType | undefined, ReadContractErrorType>>;
}

const usePriceCurveType = ({ address, abi, chainId, enabled = true }: PriceCurveTypeParams): PriceCurveTypeResponse => {
  const {
    data: contractPriceCurveType,
    refetch,
    isLoading,
    isError,
  } = useReadContract({
    address: address as `0x${string}`,
    abi,
    functionName: "priceCurveType",
    scopeKey: "priceCurveType",
    chainId,
    query: {
      staleTime: Infinity,
      select: data => Number(data) as PriceCurveType,
      enabled: !!address && !!abi && enabled,
    },
  });

  return {
    priceCurveType: (contractPriceCurveType as PriceCurveType | undefined) ?? PriceCurveType.Exponential,
    refetch,
    isLoading,
    isError,
  };
};

export default usePriceCurveType;
