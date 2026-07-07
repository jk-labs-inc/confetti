import { useQuery } from "@tanstack/react-query";
import { createClient, getChains as getLifiChains } from "@lifi/sdk";
import type { ExtendedChain } from "@lifi/types";

const lifiClient = createClient({ integrator: "Confetti" });

const useJumperBridgeChains = (chainId: number) => {
  const query = useQuery({
    queryKey: ["jumper-bridge-chains", chainId],
    queryFn: async (): Promise<ExtendedChain[]> => {
      return await getLifiChains(lifiClient);
    },
    select: (data): boolean => {
      return data.some(chain => chain.id === chainId);
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    retry: query.refetch,
  };
};

export default useJumperBridgeChains;
