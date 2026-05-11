import { PriceCurveType } from "@hooks/useDeployContest/types";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { compareVersions } from "compare-versions";
import { LOG_CURVE_VERSION } from "constants/versions";
import { Abi, ReadContractErrorType } from "viem";
import { useReadContract } from "wagmi";

interface PriceCurveTypeParams {
  address: string;
  abi: Abi;
  chainId: number;
  version?: string;
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

const usePriceCurveType = ({
  address,
  abi,
  chainId,
  version,
  enabled = true,
}: PriceCurveTypeParams): PriceCurveTypeResponse => {
  // Only contracts at LOG_CURVE_VERSION+ expose `priceCurveType`; older ones default to exponential.
  const isVersionSupported = !!version && compareVersions(version, LOG_CURVE_VERSION) >= 0;

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
      enabled: !!address && !!abi && enabled && isVersionSupported,
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
