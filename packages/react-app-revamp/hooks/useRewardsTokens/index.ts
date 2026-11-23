import { findChainIdByName } from "@helpers/getChainId";
import { useQuery } from "@tanstack/react-query";
import { getListedTokenAddresses } from "lib/rewards/database";
import { potTokenAddresses } from "lib/rewards/pot";
import { useMemo } from "react";

export function useRewardTokens(rewardsModuleAddress: string, chainName: string) {
  const { data: listedTokenAddresses, isError } = useQuery({
    queryKey: ["rewardTokens", rewardsModuleAddress, chainName],
    queryFn: async () => {
      if (!chainName) throw new Error("Network not connected");
      return getListedTokenAddresses(rewardsModuleAddress, chainName);
    },
    enabled: !!rewardsModuleAddress && !!chainName,
  });

  const data = useMemo(
    () => potTokenAddresses(findChainIdByName(chainName), listedTokenAddresses),
    [chainName, listedTokenAddresses],
  );

  return { data, isError };
}

export default useRewardTokens;
