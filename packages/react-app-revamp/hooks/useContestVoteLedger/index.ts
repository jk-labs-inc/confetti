import { isSupabaseConfigured } from "@helpers/database";
import { useChainVoteCasts } from "@hooks/useChainVoteCasts";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useQuery } from "@tanstack/react-query";
import { getContestVoteLedger } from "lib/analytics/participants/getContestVoteLedger";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { contestVoteLedgerQueryKey, LEDGER_GC_TIME } from "./constants";
import { foldLedgerCached, mergeChainCasts } from "./ledger";
import { UseContestVoteLedgerParams, UseContestVoteLedgerResult } from "./types";

export type {
  ContestVoteEvent,
  ContestVoteLedger,
  ContestVoteLedgerData,
  EntryTally,
  EntryVoterTally,
  VoterEntryTally,
  VoterTally,
} from "./types";
export { contestVoteLedgerQueryKey } from "./constants";
export { useLedgerChainSync } from "./useLedgerChainSync";
export { reconcileContestVoteLedger, useLedgerRealtime } from "./useLedgerRealtime";

export function useContestVoteLedger({ enabled = true }: UseContestVoteLedgerParams = {}): UseContestVoteLedgerResult {
  const { address, chainName } = useContestConfigStore(
    useShallow(state => ({ address: state.contestConfig.address, chainName: state.contestConfig.chainName })),
  );
  const { data, isLoading, isError } = useQuery({
    queryKey: contestVoteLedgerQueryKey(address ?? "", chainName ?? ""),
    queryFn: () => getContestVoteLedger(address, chainName),
    enabled: !!isSupabaseConfigured && !!address && !!chainName && enabled,
    staleTime: Infinity,
    gcTime: LEDGER_GC_TIME,
  });

  const { chainData, isReconciling } = useChainVoteCasts();

  const ledger = useMemo(
    () => (data ? foldLedgerCached(chainData ? mergeChainCasts(data, chainData) : data) : null),
    [data, chainData],
  );

  return { ledger, isLoading, isReconciling: !!data && isReconciling, isError };
}

export default useContestVoteLedger;
