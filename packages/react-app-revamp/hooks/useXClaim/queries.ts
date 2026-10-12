import { isXClaimConfigured } from "@config/xClaim";
import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchClaimMe, fetchSpots } from "lib/xClaim/client";
import { PENDING_POLL_INTERVAL_MS, SPOTS_STALE_MS } from "lib/xClaim/constants";
import type { ClaimMe, XClaimWallet } from "lib/xClaim/types";
import type { WithParaProof } from "./useWalletProof";

export const xClaimKeys = {
  spots: ["xClaim", "spots"] as const,
  me: (address: string | null) => ["xClaim", "me", address?.toLowerCase() ?? null] as const,
};

export const walletAddressOf = (wallet: XClaimWallet) => (wallet.kind === "signed_out" ? null : wallet.address);

export const useXClaimSpots = () =>
  useQuery({
    queryKey: xClaimKeys.spots,
    queryFn: fetchSpots,
    enabled: isXClaimConfigured,
    staleTime: SPOTS_STALE_MS,
    retry: 1,
  });

const isConfirmedPending = (data: ClaimMe | undefined) => data?.claim?.status === "pending";

export const useXClaimMe = ({
  wallet,
  shouldFetch,
  pollUntil,
  withParaProof,
}: {
  wallet: XClaimWallet;
  shouldFetch: boolean;
  pollUntil: number | null;
  withParaProof: WithParaProof;
}) => {
  const embeddedWallet = wallet.kind === "embedded" ? wallet : null;

  return useQuery({
    queryKey: xClaimKeys.me(walletAddressOf(wallet)),
    queryFn:
      embeddedWallet && isXClaimConfigured
        ? () => withParaProof({ wallet: embeddedWallet, call: fetchClaimMe })
        : skipToken,
    enabled: shouldFetch,
    staleTime: Infinity,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: query =>
      pollUntil !== null && Date.now() < pollUntil && isConfirmedPending(query.state.data)
        ? PENDING_POLL_INTERVAL_MS
        : false,
  });
};
