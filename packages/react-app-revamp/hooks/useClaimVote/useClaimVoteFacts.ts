import { isXClaimConfigured } from "@config/xClaim";
import useContestConfigStore from "@hooks/useContestConfig/store";
import { useWallet } from "@hooks/useWallet";
import { useXClaimMe, useXClaimSpots } from "@hooks/useXClaim/queries";
import { useWalletProof } from "@hooks/useXClaim/useWalletProof";
import { contestKeyOf } from "lib/claimVote/intent";
import type { ClaimVoteFacts } from "lib/claimVote/types";
import type { XClaimInput } from "lib/xClaim/types";
import { deriveOffer, paysOnChain } from "lib/xClaim/view";
import { toXClaimWallet } from "lib/xClaim/wallet";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useStoredVoteIntent } from "./useStoredVoteIntent";

export const useClaimVoteFacts = ({ enabled, pollUntil }: { enabled: boolean; pollUntil: number | null }) => {
  const { userAddress, isConnected, walletKind, loginMethod, connector } = useWallet();
  const walletName = connector?.name ?? null;
  const wallet = useMemo(
    () => toXClaimWallet({ userAddress, isConnected, walletKind, loginMethod, walletName }),
    [userAddress, isConnected, walletKind, loginMethod, walletName],
  );
  const { chainName, address } = useContestConfigStore(
    useShallow(state => ({ chainName: state.contestConfig.chainName, address: state.contestConfig.address })),
  );
  const contest = useMemo(() => contestKeyOf({ chain: chainName, address }), [chainName, address]);
  const intent = useStoredVoteIntent();
  const { withParaProof } = useWalletProof();

  const spotsQuery = useXClaimSpots({ enabled });
  const onPayoutChain = !!spotsQuery.data && paysOnChain(spotsQuery.data, contest.chain);
  const meQuery = useXClaimMe({
    wallet,
    shouldFetch: enabled && (onPayoutChain || intent !== null),
    pollUntil,
    withParaProof,
  });

  const me = meQuery.data ?? null;
  const meFailedAt = meQuery.isError ? meQuery.errorUpdatedAt : 0;
  const meSettled = wallet.kind !== "embedded" || me !== null || meFailedAt > 0;

  return useMemo((): ClaimVoteFacts => {
    const input: XClaimInput = {
      configured: isXClaimConfigured && enabled,
      contestChain: contest.chain,
      wallet,
      spots: spotsQuery.data ?? null,
      spotsFailed: spotsQuery.isError,
      me,
      meUpdatedAt: meQuery.dataUpdatedAt,
      meFailedAt,
      meLoading: !meSettled,
      result: null,
      action: { name: null, stage: "idle", error: null },
    };
    return {
      contest,
      wallet,
      spots: input.spots,
      spotsFailed: input.spotsFailed,
      me,
      meUpdatedAt: input.meUpdatedAt,
      meFailedAt,
      meSettled,
      offer: deriveOffer(input),
      intent,
    };
  }, [
    enabled,
    contest,
    wallet,
    spotsQuery.data,
    spotsQuery.isError,
    me,
    meQuery.dataUpdatedAt,
    meFailedAt,
    meSettled,
    intent,
  ]);
};
