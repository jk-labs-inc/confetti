import { makeParticipantsHandler } from "@hooks/useContestRealtime/handlers";
import { useQueryClient } from "@tanstack/react-query";
import { subscribe } from "lib/realtime";
import { useEffect } from "react";

const REFRESH_DEBOUNCE_MS = 600;
const REFRESH_JITTER_MS = 400;
const RECONCILE_THROTTLE_MS = 10_000;

interface UseContestCardRealtimeParams {
  address: string;
  chainName: string;
  chainId: number | undefined;
  enabled: boolean;
}

export function useContestCardRealtime({ address, chainName, chainId, enabled }: UseContestCardRealtimeParams) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !address || !chainId) return;

    const contestAddress = address.toLowerCase();
    const votesQueryKey = ["contestEntriesVotes", contestAddress, chainId];
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = () => {
      if (refreshTimer) return;
      refreshTimer = setTimeout(
        () => {
          refreshTimer = null;
          void queryClient.invalidateQueries({ queryKey: votesQueryKey });
        },
        REFRESH_DEBOUNCE_MS + Math.floor(Math.random() * REFRESH_JITTER_MS),
      );
    };

    let lastReconcileAt = 0;
    const reconcileNow = () => {
      const now = Date.now();
      if (now - lastReconcileAt < RECONCILE_THROTTLE_MS) return;
      lastReconcileAt = now;
      void queryClient.invalidateQueries({ queryKey: votesQueryKey });
    };

    const handle = makeParticipantsHandler({
      onVote: scheduleRefresh,
      onSubmit: scheduleRefresh,
      onDelete: scheduleRefresh,
    });

    let hasConnected = false;
    let droppedSinceConnect = false;
    const onStatus = (status: string) => {
      if (status === "SUBSCRIBED") {
        if (hasConnected && droppedSinceConnect) {
          droppedSinceConnect = false;
          reconcileNow();
        }
        hasConnected = true;
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        if (hasConnected) droppedSinceConnect = true;
      }
    };

    const subscription = subscribe({
      channelKey: `landing:participants:${chainName}:${contestAddress}`,
      tableKey: "analytics_contest_participants_v3",
      filterValue: contestAddress,
      onEvent: handle,
      onStatus,
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") reconcileNow();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      subscription.unsubscribe();
    };
  }, [enabled, address, chainId, chainName, queryClient]);
}

export default useContestCardRealtime;
