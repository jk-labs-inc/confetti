import { isSupabaseConfigured } from "@helpers/database";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { VoteEvent } from "@hooks/useContestRealtime/types";
import { hashKey, QueryClient, useQueryClient } from "@tanstack/react-query";
import { ContestVoteEvent, getContestVoteEvents } from "lib/analytics/participants/getContestVoteEvents";
import { ContestVoteLedgerData } from "lib/analytics/participants/getContestVoteLedger";
import { ContestParticipantEvent, subscribe } from "lib/realtime";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { RECONCILE_THROTTLE_MS } from "@hooks/useContestRealtime/constants";
import { contestVoteLedgerQueryKey, LEDGER_PAGE_SIZE, LEDGER_WRITE_COALESCE_MS } from "./constants";
import { mergeCasts } from "./ledger";

interface ReconcileContestVoteLedgerParams {
  address: string;
  chainName: string;
}

const DROPPED_STATUSES = new Set(["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"]);

export async function reconcileContestVoteLedger(
  queryClient: QueryClient,
  { address, chainName }: ReconcileContestVoteLedgerParams,
): Promise<void> {
  if (!address || !chainName) return;
  const queryKey = contestVoteLedgerQueryKey(address, chainName);
  const status = queryClient.getQueryState(queryKey)?.status;

  if (status === "error") {
    await queryClient.invalidateQueries({ queryKey });
    return;
  }
  if (status !== "success") return;

  const recent = await getContestVoteEvents(address, chainName, 0, LEDGER_PAGE_SIZE);
  if (recent.length === 0) return;
  queryClient.setQueryData<ContestVoteLedgerData>(queryKey, prev => mergeCasts(prev, recent));
}

const toContestVoteEvent = (event: VoteEvent, voteAmount: number, createdAt: number): ContestVoteEvent => ({
  uuid: event.uuid,
  userAddress: event.userAddress,
  proposalId: event.proposalId,
  proposalName: event.proposalName,
  voteAmount,
  amountSent: event.amountSent,
  createdAt,
});

export function useLedgerRealtime(): void {
  const { address, chainName } = useContestConfigStore(
    useShallow(state => ({ address: state.contestConfig.address, chainName: state.contestConfig.chainName })),
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!address || !chainName || !isSupabaseConfigured) return;

    const normalizedAddress = address.toLowerCase();
    const normalizedChainName = chainName.toLowerCase();
    const queryKey = contestVoteLedgerQueryKey(address, chainName);
    const queryHash = hashKey(queryKey);
    const pendingCasts = new Map<string, ContestVoteEvent>();
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    const hasLedgerData = () => queryClient.getQueryState(queryKey)?.status === "success";

    const flushPending = () => {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      if (pendingCasts.size === 0 || !hasLedgerData()) return;
      const casts = Array.from(pendingCasts.values());
      pendingCasts.clear();
      queryClient.setQueryData<ContestVoteLedgerData>(queryKey, prev => mergeCasts(prev, casts));
    };

    const scheduleFlush = () => {
      if (flushTimer) return;
      flushTimer = setTimeout(flushPending, LEDGER_WRITE_COALESCE_MS);
    };

    const unsubscribeCache = queryClient.getQueryCache().subscribe(event => {
      if (event.type !== "updated" || event.action.type !== "success") return;
      if (event.query.queryHash === queryHash) flushPending();
    });

    const onEvent = (event: ContestParticipantEvent) => {
      if (event.type !== "vote.cast") return;
      if (event.networkName?.toLowerCase() !== normalizedChainName) return;
      if (!event.uuid || !event.userAddress || !event.proposalId) return;
      if (event.voteAmount == null || event.createdAt == null) return;
      const cast = toContestVoteEvent(event, event.voteAmount, event.createdAt);
      pendingCasts.set(cast.uuid, cast);
      scheduleFlush();
    };

    let lastReconcileAt = 0;
    const reconcile = () => {
      const now = Date.now();
      if (now - lastReconcileAt < RECONCILE_THROTTLE_MS) return;
      lastReconcileAt = now;
      void reconcileContestVoteLedger(queryClient, { address, chainName });
    };

    let hasConnected = false;
    let droppedSinceConnect = false;
    const onStatus = (status: string) => {
      if (status === "SUBSCRIBED") {
        if (hasConnected && droppedSinceConnect) {
          droppedSinceConnect = false;
          reconcile();
        }
        hasConnected = true;
      } else if (DROPPED_STATUSES.has(status)) {
        if (hasConnected) droppedSinceConnect = true;
      }
    };

    const subscription = subscribe({
      channelKey: `participants:${chainName}:${normalizedAddress}`,
      tableKey: "analytics_contest_participants_v3",
      filterValue: normalizedAddress,
      onEvent,
      onStatus,
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") reconcile();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      if (flushTimer) clearTimeout(flushTimer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      unsubscribeCache();
      subscription.unsubscribe();
    };
  }, [address, chainName, queryClient]);
}

export default useLedgerRealtime;
