import { isXClaimConfigured } from "@config/xClaim";
import { useWallet } from "@hooks/useWallet";
import type { XClaimActions, XClaimInput, XClaimOffer, XClaimSheetView, XClaimWallet } from "lib/xClaim/types";
import { deriveOffer, deriveView } from "lib/xClaim/view";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useXClaimMe, useXClaimSpots, walletAddressOf } from "./queries";
import { useXClaimStore } from "./store";
import { useWalletProof } from "./useWalletProof";
import { useXClaimActions } from "./useXClaimActions";

export interface XClaimHookReturn {
  offer: XClaimOffer;
  sheet: { isOpen: boolean; view: XClaimSheetView };
  actions: XClaimActions;
}

const toXClaimWallet = ({
  userAddress,
  isConnected,
  walletKind,
  loginMethod,
  walletName,
}: Pick<ReturnType<typeof useWallet>, "userAddress" | "isConnected" | "walletKind" | "loginMethod"> & {
  walletName: string | null;
}): XClaimWallet => {
  if (!isConnected || !userAddress || !walletKind) return { kind: "signed_out" };
  if (walletKind === "external") return { kind: "external", address: userAddress, walletName };
  return { kind: "embedded", address: userAddress, signedInWithX: loginMethod === "TWITTER" };
};

export const useXClaim = (): XClaimHookReturn => {
  const { userAddress, isConnected, walletKind, loginMethod, connector } = useWallet();
  const walletName = connector?.name ?? null;
  const wallet = useMemo(
    () => toXClaimWallet({ userAddress, isConnected, walletKind, loginMethod, walletName }),
    [userAddress, isConnected, walletKind, loginMethod, walletName],
  );

  const { isOpen, result, action, pollUntil, memory, signInPending } = useXClaimStore(
    useShallow(state => ({
      isOpen: state.isOpen,
      result: state.result,
      action: state.action,
      pollUntil: state.pollUntil,
      memory: state.memory,
      signInPending: state.signIn.pending,
    })),
  );

  const { withParaProof, runWithProof } = useWalletProof(connector);
  const spotsQuery = useXClaimSpots();
  const spotsOpen = !!spotsQuery.data && spotsQuery.data.open > 0 && !spotsQuery.data.paused;
  const meQuery = useXClaimMe({
    wallet,
    shouldFetch: spotsOpen || isOpen || result !== null || signInPending,
    pollUntil,
    withParaProof,
  });
  const actions = useXClaimActions({ wallet, runWithProof });

  const address = walletAddressOf(wallet);
  const memoryState = wallet.kind === "external" && memory?.address === address ? memory.state : null;

  const input = useMemo(
    (): XClaimInput => ({
      configured: isXClaimConfigured,
      wallet,
      spots: spotsQuery.data ?? null,
      spotsFailed: spotsQuery.isError,
      me: meQuery.data ?? null,
      meUpdatedAt: meQuery.dataUpdatedAt,
      meFailedAt: meQuery.isError ? meQuery.errorUpdatedAt : 0,
      meLoading: meQuery.isLoading,
      memory: memoryState,
      result,
      action,
    }),
    [
      wallet,
      spotsQuery.data,
      spotsQuery.isError,
      meQuery.data,
      meQuery.dataUpdatedAt,
      meQuery.isError,
      meQuery.errorUpdatedAt,
      meQuery.isLoading,
      memoryState,
      result,
      action,
    ],
  );

  const view = useMemo(() => deriveView(input), [input]);
  const offer = useMemo(() => deriveOffer(input), [input]);

  return { offer, sheet: { isOpen, view }, actions };
};
