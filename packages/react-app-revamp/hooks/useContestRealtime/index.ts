import useContestConfigStore from "@hooks/useContestConfig/store";
import useProposal from "@hooks/useProposal";
import { useProposalStore } from "@hooks/useProposal/store";
import { useQueryClient } from "@tanstack/react-query";
import { subscribe } from "lib/realtime";
import { useEffect, useRef, useState } from "react";
import { invalidateAllProposalVoters, invalidateProposalVoters } from "@hooks/useProposalVoters/invalidate";
import { useShallow } from "zustand/react/shallow";
import { makeParticipantsHandler } from "./handlers";
import { reconcileProposalVotes, refreshProposalVotes } from "./refreshProposalVotes";

const REWARD_QUERY_KEYS = [["totalRewards"], ["totalRewardsForRank"]];
const REFRESH_DEBOUNCE_MS = 600;
const REFRESH_JITTER_MS = 400;
// Reconcile the whole visible list at most once per window (reconnect + refocus can otherwise race).
const RECONCILE_THROTTLE_MS = 10_000;

// Mounted once from useLayoutViewContest. Subscribes the open contest to live participant activity
// and, on a vote, re-reads the entry's on-chain tally, re-ranks the list, and refreshes rewards.
export function useContestRealtime(): { isConnected: boolean } {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { updateProposal } = useProposal();
  const listProposalsData = useProposalStore(useShallow(state => state.listProposalsData));
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  const contestConfigRef = useRef(contestConfig);
  contestConfigRef.current = contestConfig;
  const listRef = useRef(listProposalsData);
  listRef.current = listProposalsData;
  const updateProposalRef = useRef(updateProposal);
  updateProposalRef.current = updateProposal;

  const { address, chainId, chainName } = contestConfig;

  useEffect(() => {
    if (!address || !chainId) return;

    const contestAddress = address.toLowerCase();
    const voteTimers = new Map<string, ReturnType<typeof setTimeout>>();
    let rewardsTimer: ReturnType<typeof setTimeout> | null = null;

    const invalidateRewards = () => {
      if (rewardsTimer) return;
      rewardsTimer = setTimeout(() => {
        rewardsTimer = null;
        REWARD_QUERY_KEYS.forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
      }, REFRESH_DEBOUNCE_MS);
    };

    // Re-sync the whole visible list from chain (the recovery path for postgres_changes' missed
    // events). Throttled so reconnect and tab-refocus can't double-fire it within a short window.
    let lastReconcileAt = 0;
    const reconcileNow = (reason: string) => {
      const now = Date.now();
      if (now - lastReconcileAt < RECONCILE_THROTTLE_MS) return;
      lastReconcileAt = now;
      void reconcileProposalVotes({
        contestConfig: contestConfigRef.current,
        listProposalsData: listRef.current,
        updateProposal: updateProposalRef.current,
      }).catch(e => console.error(`[realtime] reconcile (${reason}) failed`, e));
      invalidateRewards();
      // We may have missed votes, so refresh any open voters list too.
      void invalidateAllProposalVoters(queryClient).catch(e =>
        console.error("[realtime] failed to invalidate voters after reconcile", e),
      );
    };

    const handle = makeParticipantsHandler({
      onVote: event => {
        invalidateRewards();

        const { proposalId } = event;
        const pending = voteTimers.get(proposalId);
        if (pending) clearTimeout(pending);
        voteTimers.set(
          proposalId,
          setTimeout(
            () => {
              voteTimers.delete(proposalId);
              void refreshProposalVotes({
                contestConfig: contestConfigRef.current,
                proposalId,
                updateProposal: updateProposalRef.current,
              }).catch(e => console.error("[realtime] failed to refresh proposal votes", e));
              // Refresh the entry's voters list (address list + per-voter votes) so the new voter shows.
              void invalidateProposalVoters(queryClient, {
                contractAddress: contestConfigRef.current.address,
                chainId: contestConfigRef.current.chainId,
                proposalId,
              }).catch(e => console.error("[realtime] failed to invalidate proposal voters", e));
            },
            REFRESH_DEBOUNCE_MS + Math.floor(Math.random() * REFRESH_JITTER_MS),
          ),
        );
      },
    });

    // postgres_changes has no delivery guarantee, so a >~30s drop loses events. On re-subscribe
    // after a drop, reconcile the visible list against chain so it can't go silently stale.
    let hasConnected = false;
    let droppedSinceConnect = false;
    const onStatus = (status: string) => {
      if (status === "SUBSCRIBED") {
        if (hasConnected && droppedSinceConnect) {
          droppedSinceConnect = false;
          reconcileNow("reconnect");
        }
        hasConnected = true;
        setIsConnected(true);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        if (hasConnected) droppedSinceConnect = true;
        setIsConnected(false);
      }
    };

    const subscription = subscribe({
      channelKey: `participants:${chainName}:${contestAddress}`,
      tableKey: "analytics_contest_participants_v3",
      filterValue: contestAddress,
      onEvent: handle,
      onStatus,
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") reconcileNow("refocus");
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      voteTimers.forEach(timer => clearTimeout(timer));
      if (rewardsTimer) clearTimeout(rewardsTimer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [address, chainId, chainName, queryClient]);

  return { isConnected };
}

export default useContestRealtime;
