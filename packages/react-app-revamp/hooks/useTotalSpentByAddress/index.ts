import { ANALYTICS_VERSION } from "constants/versions";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { compareVersions } from "compare-versions";
import { useReadContract } from "wagmi";
import { useShallow } from "zustand/shallow";

interface UseTotalSpentByAddressParams {
  contestAddress: `0x${string}`;
  chainId: number;
  userAddress?: `0x${string}`;
}

const useTotalSpentByAddress = ({ contestAddress, chainId, userAddress }: UseTotalSpentByAddressParams) => {
  const { abi, version } = useContestConfigStore(useShallow(state => state.contestConfig));
  const isAnalyticsSupported = !!version && compareVersions(version, ANALYTICS_VERSION) >= 0;

  const result = useReadContract({
    address: contestAddress,
    abi,
    chainId,
    functionName: "getTotalSpentByAddress",
    args: [userAddress],
    query: {
      select: (data: unknown) => (data as bigint) ?? 0n,
      enabled: isAnalyticsSupported && !!abi && !!contestAddress && !!userAddress && !!chainId,
    },
  });

  return {
    totalSpent: isAnalyticsSupported ? result.data ?? 0n : 0n,
    isAnalyticsSupported,
    isLoading: isAnalyticsSupported ? result.isLoading : false,
    isError: isAnalyticsSupported ? result.isError : false,
    refetch: result.refetch,
  };
};

export default useTotalSpentByAddress;
