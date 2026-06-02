import useContestConfigStore from "@hooks/useContestConfig/store";
import useProposal from "@hooks/useProposal";
import { useProposalStore } from "@hooks/useProposal/store";
import { useWallet } from "@hooks/useWallet";
import { useQueryClient } from "@tanstack/react-query";
import { subscribe } from "lib/realtime";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { makeParticipantsHandler } from "./handlers";
import { reconcileProposalVotes, refreshProposalVotes } from "./refreshProposalVotes";

const REWARD_QUERY_KEYS = [["totalRewards"], ["totalRewardsForRank"]];
const REFRESH_DEBOUNCE_MS = 600;

// Mounted once from useLayoutViewContest. Subscribes the open contest to live participant activity
// and, on a vote, re-reads the entry's on-chain tally, re-ranks the list, and refreshes rewards.
export function useContestRealtime(): { isConnected: boolean } {
  const { contestConfig } = useContestConfigStore(useShallow(state => state));
  const { updateProposal } = useProposal();
  const listProposalsData = useProposalStore(useShallow(state => state.listProposalsData));
  const queryClient = useQueryClient();
  const { userAddress } = useWallet();
  const [isConnected, setIsConnected] = useState(false);

  const contestConfigRef = useRef(contestConfig);
  contestConfigRef.current = contestConfig;
  const listRef = useRef(listProposalsData);
  listRef.current = listProposalsData;
  const updateProposalRef = useRef(updateProposal);
  updateProposalRef.current = updateProposal;
  const userAddressRef = useRef(userAddress);
  userAddressRef.current = userAddress;

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

    const handle = makeParticipantsHandler({
      onVote: event => {
        // Our own cast already updated the UI (useCastVotes), so skip the on-chain re-read for our
        // own echo — but still refresh rewards.
        const isOwnEcho =
          !!userAddressRef.current && event.userAddress?.toLowerCase() === userAddressRef.current.toLowerCase();

        invalidateRewards();
        if (isOwnEcho) return;

        const { proposalId } = event;
        const pending = voteTimers.get(proposalId);
        if (pending) clearTimeout(pending);
        voteTimers.set(
          proposalId,
          setTimeout(() => {
            voteTimers.delete(proposalId);
            void refreshProposalVotes({
              contestConfig: contestConfigRef.current,
              proposalId,
              listProposalsData: listRef.current,
              updateProposal: updateProposalRef.current,
            }).catch(e => console.error("[realtime] failed to refresh proposal votes", e));
          }, REFRESH_DEBOUNCE_MS),
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
          void reconcileProposalVotes({
            contestConfig: contestConfigRef.current,
            listProposalsData: listRef.current,
            updateProposal: updateProposalRef.current,
          }).catch(e => console.error("[realtime] reconcile after reconnect failed", e));
          invalidateRewards();
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

    return () => {
      voteTimers.forEach(timer => clearTimeout(timer));
      if (rewardsTimer) clearTimeout(rewardsTimer);
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [address, chainId, chainName, queryClient]);

  return { isConnected };
}

export default useContestRealtime;
