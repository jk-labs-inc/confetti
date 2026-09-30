import useContestConfigStore from "@hooks/useContestConfig/store";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/shallow";
import { chainVoteCastsQueryKey } from "./constants";
import { ChainVoteCastsData } from "./types";

export type { ChainVoteCastsData } from "./types";
export { recoverUnrecordedCasts } from "./casts";

interface UseChainVoteCastsResult {
  chainData: ChainVoteCastsData | undefined;
  isReconciling: boolean;
}

export function useChainVoteCasts(): UseChainVoteCastsResult {
  const { address, chainId } = useContestConfigStore(
    useShallow(state => ({ address: state.contestConfig.address, chainId: state.contestConfig.chainId })),
  );
  const { data, isLoading } = useQuery<ChainVoteCastsData>({
    queryKey: chainVoteCastsQueryKey(address ?? "", chainId),
    queryFn: skipToken,
  });

  return { chainData: data, isReconciling: isLoading };
}

export default useChainVoteCasts;
