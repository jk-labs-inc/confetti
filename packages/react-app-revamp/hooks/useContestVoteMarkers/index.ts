import { ContestVoteEvent, getContestVoteEvents } from "lib/analytics/participants/getContestVoteEvents";
import { ContestParticipantEvent, subscribe } from "lib/realtime";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

export type { ContestVoteEvent };

interface UseContestVoteMarkersParams {
  contestAddress: string;
  chainName: string;
  enabled: boolean;
}

interface UseContestVoteMarkersResult {
  voteEvents: ContestVoteEvent[];
  isLoading: boolean;
  isError: boolean;
}

const RECONCILE_THROTTLE_MS = 10_000;

export function useContestVoteMarkers({
  contestAddress,
  chainName,
  enabled,
}: UseContestVoteMarkersParams): UseContestVoteMarkersResult {
  const {
    data: fetchedEvents = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["contestVoteEvents", contestAddress?.toLowerCase()],
    queryFn: () => getContestVoteEvents(contestAddress),
    enabled: enabled && !!contestAddress,
    staleTime: Infinity,
  });

  const [liveEvents, setLiveEvents] = useState<Map<string, ContestVoteEvent>>(() => new Map());

  const prevContestAddress = useRef(contestAddress);
  if (prevContestAddress.current !== contestAddress) {
    prevContestAddress.current = contestAddress;
    setLiveEvents(new Map());
  }

  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (!contestAddress || !chainName) return;

    const normalizedAddress = contestAddress.toLowerCase();

    const onEvent = (event: ContestParticipantEvent) => {
      if (event.type !== "vote.cast") return;
      if (event.voteAmount == null || event.createdAt == null || !event.uuid) return;
      const voteEvent: ContestVoteEvent = {
        uuid: event.uuid,
        userAddress: event.userAddress,
        proposalId: event.proposalId,
        voteAmount: event.voteAmount,
        amountSent: event.amountSent,
        createdAt: event.createdAt,
      };
      setLiveEvents(prev => {
        if (prev.has(voteEvent.uuid)) return prev;
        const next = new Map(prev);
        next.set(voteEvent.uuid, voteEvent);
        return next;
      });
    };

    let lastReconcileAt = 0;
    const reconcile = () => {
      const now = Date.now();
      if (now - lastReconcileAt < RECONCILE_THROTTLE_MS) return;
      lastReconcileAt = now;
      void refetchRef.current();
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
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
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
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      subscription.unsubscribe();
    };
  }, [contestAddress, chainName]);

  // Merge fetched + live, deduped by uuid, sorted chronologically.
  const voteEvents = useMemo(() => {
    const byUuid = new Map<string, ContestVoteEvent>();
    for (const event of fetchedEvents) byUuid.set(event.uuid, event);
    for (const [uuid, event] of liveEvents) byUuid.set(uuid, event);
    return Array.from(byUuid.values()).sort((a, b) => a.createdAt - b.createdAt);
  }, [fetchedEvents, liveEvents]);

  return { voteEvents, isLoading, isError };
}

export default useContestVoteMarkers;
