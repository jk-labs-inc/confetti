import { useQuery } from "@tanstack/react-query";
import { fetchTotalRewards } from "lib/rewards/contracts";
import { Address, Abi } from "viem";

interface UseTotalRewardsParams {
  rewardsModuleAddress?: Address;
  rewardsModuleAbi?: Abi;
  chainId?: number;
  enabled?: boolean;
}

export function useTotalRewards({
  rewardsModuleAddress,
  rewardsModuleAbi,
  chainId,
  enabled = true,
}: UseTotalRewardsParams) {
  return useQuery({
    queryKey: ["totalRewards", rewardsModuleAddress, chainId],
    queryFn: async () => {
      if (!rewardsModuleAddress || !rewardsModuleAbi || !chainId) {
        throw new Error("Missing required parameters");
      }

      return await fetchTotalRewards({
        rewardsModuleAddress,
        rewardsModuleAbi,
        chainId,
      });
    },
    enabled: enabled && !!rewardsModuleAddress && !!rewardsModuleAbi && !!chainId,
  });
}
