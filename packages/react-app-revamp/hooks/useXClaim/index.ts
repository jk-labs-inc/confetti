import { isXClaimConfigured } from "@config/xClaim";
import { useWallet } from "@hooks/useWallet";
import type { XClaimActions, XClaimInput, XClaimSheetView } from "lib/xClaim/types";
import { deriveView } from "lib/xClaim/view";
import { toXClaimWallet } from "lib/xClaim/wallet";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useXClaimMe, useXClaimSpots } from "./queries";
import { useXClaimStore } from "./store";
import { useWalletProof } from "./useWalletProof";
import { useXClaimActions } from "./useXClaimActions";

export interface XClaimHookReturn {
  sheet: { isOpen: boolean; view: XClaimSheetView };
  actions: XClaimActions;
}

export const useXClaim = (): XClaimHookReturn => {
  const { userAddress, isConnected, walletKind, loginMethod, connector } = useWallet();
  const walletName = connector?.name ?? null;
  const params = useParams();
  const contestChain = typeof params?.chain === "string" ? params.chain.toLowerCase() : null;
  const wallet = useMemo(
    () => toXClaimWallet({ userAddress, isConnected, walletKind, loginMethod, walletName }),
    [userAddress, isConnected, walletKind, loginMethod, walletName],
  );

  const { isOpen, result, action, pollUntil } = useXClaimStore(
    useShallow(state => ({
      isOpen: state.isOpen,
      result: state.result,
      action: state.action,
      pollUntil: state.pollUntil,
    })),
  );

  const isSheetActive = isOpen || result !== null;
  const { withParaProof } = useWalletProof();
  const spotsQuery = useXClaimSpots({ enabled: isSheetActive });
  const meQuery = useXClaimMe({ wallet, shouldFetch: isSheetActive, pollUntil, withParaProof });
  const actions = useXClaimActions({ wallet });

  const input = useMemo(
    (): XClaimInput => ({
      configured: isXClaimConfigured,
      contestChain,
      wallet,
      spots: spotsQuery.data ?? null,
      spotsFailed: spotsQuery.isError,
      me: meQuery.data ?? null,
      meUpdatedAt: meQuery.dataUpdatedAt,
      meFailedAt: meQuery.isError ? meQuery.errorUpdatedAt : 0,
      meLoading: meQuery.isLoading,
      result,
      action,
    }),
    [
      contestChain,
      wallet,
      spotsQuery.data,
      spotsQuery.isError,
      meQuery.data,
      meQuery.dataUpdatedAt,
      meQuery.isError,
      meQuery.errorUpdatedAt,
      meQuery.isLoading,
      result,
      action,
    ],
  );

  const view = useMemo(() => deriveView(input), [input]);

  return { sheet: { isOpen, view }, actions };
};
