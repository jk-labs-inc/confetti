import {
  CHAIN_VOTE_CASTS_GC_TIME,
  CHAIN_VOTE_CASTS_SCAN_RETRIES,
  chainVoteCastsQueryKey,
} from "@hooks/useChainVoteCasts/constants";
import { fetchChainVoteCasts, resolveScanFromSec } from "@hooks/useChainVoteCasts/scan";
import { ChainVoteCastsData } from "@hooks/useChainVoteCasts/types";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useContestVoteTimings } from "@hooks/useContestVoteTimings";
import { useProposalStore } from "@hooks/useProposal/store";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { compareVersions } from "compare-versions";
import { DOWNVOTES_REMOVED_VERSION } from "constants/versions";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import {
  contestVoteLedgerQueryKey,
  LEDGER_GAP_DEBOUNCE_MS,
  LEDGER_GAP_MIN_VOTES,
  LEDGER_GAP_RELATIVE_TOLERANCE,
} from "./constants";
import { foldLedgerCached, mergeChainCasts } from "./ledger";
import { ContestVoteLedgerData } from "./types";

const ignoreScanError = () => {};

function useSettledLedgerGap(gap: number | null, delayMs: number): number | null {
  const [settledGap, setSettledGap] = useState(gap);
  const hasSettledRef = useRef(gap !== null);

  useEffect(() => {
    if (gap === null) return;
    if (!hasSettledRef.current) {
      hasSettledRef.current = true;
      setSettledGap(gap);
      return;
    }
    const timeout = setTimeout(() => setSettledGap(gap), delayMs);
    return () => clearTimeout(timeout);
  }, [gap, delayMs]);

  return settledGap;
}

export function useLedgerChainSync(): void {
  const { address, abi, chainId, chainName, version } = useContestConfigStore(
    useShallow(state => ({
      address: state.contestConfig.address,
      abi: state.contestConfig.abi,
      chainId: state.contestConfig.chainId,
      chainName: state.contestConfig.chainName,
      version: state.contestConfig.version,
    })),
  );
  const chainEntries = useProposalStore(state => state.initialMappedProposalIds);
  const { voteTimings } = useContestVoteTimings({ address: address as `0x${string}`, chainId, abi });
  const queryClient = useQueryClient();
  const supportsVoteCastLogs = !!version && compareVersions(version, DOWNVOTES_REMOVED_VERSION) >= 0;

  const ledgerKey = useMemo(() => contestVoteLedgerQueryKey(address ?? "", chainName ?? ""), [address, chainName]);
  const chainKey = useMemo(() => chainVoteCastsQueryKey(address ?? "", chainId), [address, chainId]);
  const { data: recorded } = useQuery<ContestVoteLedgerData>({ queryKey: ledgerKey, queryFn: skipToken });
  const { data: chainData } = useQuery<ChainVoteCastsData>({ queryKey: chainKey, queryFn: skipToken });

  const gapState = useMemo(() => {
    if (!recorded || chainEntries.length === 0) return null;
    const ledger = foldLedgerCached(chainData ? mergeChainCasts(recorded, chainData) : recorded);
    let chainVotes = 0;
    let ledgerVotes = 0;
    for (const entry of chainEntries) {
      chainVotes += entry.votes;
      ledgerVotes += ledger.byEntry.get(entry.id)?.ledgerVotes ?? 0;
    }
    return {
      gap: Math.round(chainVotes - ledgerVotes),
      tolerance: Math.max(LEDGER_GAP_MIN_VOTES, chainVotes * LEDGER_GAP_RELATIVE_TOLERANCE),
    };
  }, [recorded, chainData, chainEntries]);

  const settledGap = useSettledLedgerGap(gapState?.gap ?? null, LEDGER_GAP_DEBOUNCE_MS);
  const hasGap = settledGap !== null && !!gapState && Math.abs(settledGap) > gapState.tolerance;
  const voteStartSec = voteTimings?.voteStart;
  const voteEndSec = voteTimings?.contestDeadline;

  useEffect(() => {
    if (!hasGap || !supportsVoteCastLogs || !address || !abi) return;
    if (voteStartSec === undefined || voteEndSec === undefined) return;

    const scan = () =>
      queryClient.fetchQuery({
        queryKey: chainKey,
        queryFn: () => {
          const latestRecorded = queryClient.getQueryData<ContestVoteLedgerData>(ledgerKey);
          return fetchChainVoteCasts({
            contest: { address: address as `0x${string}`, abi, chainId },
            scanFromSec: resolveScanFromSec(latestRecorded, voteStartSec),
            voteEndSec,
            recordedCasts: latestRecorded?.casts ?? [],
            previous: queryClient.getQueryData<ChainVoteCastsData>(chainKey),
          });
        },
        staleTime: 0,
        gcTime: CHAIN_VOTE_CASTS_GC_TIME,
        retry: CHAIN_VOTE_CASTS_SCAN_RETRIES,
      });

    const isScanInFlight = queryClient.getQueryState(chainKey)?.fetchStatus === "fetching";
    const request = scan();
    (isScanInFlight ? request.then(scan, scan) : request).catch(ignoreScanError);
  }, [
    settledGap,
    hasGap,
    supportsVoteCastLogs,
    address,
    abi,
    chainId,
    voteStartSec,
    voteEndSec,
    queryClient,
    chainKey,
    ledgerKey,
  ]);
}

export default useLedgerChainSync;
