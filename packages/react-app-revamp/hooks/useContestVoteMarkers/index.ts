import {
  ContestVoteEvent,
  getContestVoteEvents,
  INITIAL_VOTE_PAGE_SIZE,
  MORE_VOTE_PAGE_SIZE,
} from "lib/analytics/participants/getContestVoteEvents";
import { ContestParticipantEvent, subscribe } from "lib/realtime";
import { useInfiniteQuery } from "@tanstack/react-query";
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
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const RECONCILE_THROTTLE_MS = 10_000;

export function useContestVoteMarkers({
  contestAddress,
  chainName,
  enabled,
}: UseContestVoteMarkersParams): UseContestVoteMarkersResult {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["contestVoteEvents", contestAddress?.toLowerCase(), chainName?.toLowerCase()],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getContestVoteEvents(
        contestAddress,
        chainName,
        pageParam,
        pageParam === 0 ? INITIAL_VOTE_PAGE_SIZE : MORE_VOTE_PAGE_SIZE,
      ),
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      const requested = lastPageParam === 0 ? INITIAL_VOTE_PAGE_SIZE : MORE_VOTE_PAGE_SIZE;
      if (lastPage.length < requested) return undefined;
      return allPages.reduce((total, page) => total + page.length, 0);
    },
    enabled: enabled && !!contestAddress && !!chainName,
    staleTime: Infinity,
  });

  const fetchedEvents = useMemo<ContestVoteEvent[]>(() => data?.pages.flat() ?? [], [data]);

  const [liveEvents, setLiveEvents] = useState<Map<string, ContestVoteEvent>>(() => new Map());

  const liveKey = `${contestAddress?.toLowerCase()}:${chainName?.toLowerCase()}`;
  const prevLiveKey = useRef(liveKey);
  if (prevLiveKey.current !== liveKey) {
    prevLiveKey.current = liveKey;
    setLiveEvents(new Map());
  }

  useEffect(() => {
    if (!contestAddress || !chainName) return;

    const normalizedAddress = contestAddress.toLowerCase();
    const normalizedChainName = chainName.toLowerCase();
    let cancelled = false;

    const onEvent = (event: ContestParticipantEvent) => {
      if (event.type !== "vote.cast") return;
      if (event.networkName?.toLowerCase() !== normalizedChainName) return;
      if (event.voteAmount == null || event.createdAt == null || !event.uuid) return;
      const voteEvent: ContestVoteEvent = {
        uuid: event.uuid,
        userAddress: event.userAddress,
        proposalId: event.proposalId,
        proposalName: event.proposalName,
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

      void getContestVoteEvents(contestAddress, chainName, 0, MORE_VOTE_PAGE_SIZE).then(recent => {
        if (cancelled || recent.length === 0) return;
        setLiveEvents(prev => {
          let next: Map<string, ContestVoteEvent> | null = null;
          for (const ev of recent) {
            if (!prev.has(ev.uuid)) {
              if (!next) next = new Map(prev);
              next.set(ev.uuid, ev);
            }
          }
          return next ?? prev;
        });
      });
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
      cancelled = true;
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      subscription.unsubscribe();
    };
  }, [contestAddress, chainName]);

  const voteEvents = useMemo(() => {
    const byUuid = new Map<string, ContestVoteEvent>();
    for (const event of fetchedEvents) byUuid.set(event.uuid, event);
    for (const [uuid, event] of liveEvents) byUuid.set(uuid, event);
    return Array.from(byUuid.values()).sort((a, b) => a.createdAt - b.createdAt);
  }, [fetchedEvents, liveEvents]);

  return { voteEvents, isLoading, isError, fetchNextPage, hasNextPage: !!hasNextPage, isFetchingNextPage };
}

export default useContestVoteMarkers;
