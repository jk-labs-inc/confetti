import { useModal } from "@getpara/react-sdk-lite";
import { useEmbeddedOnlySignIn } from "@hooks/useParaSignIn";
import { useQueryClient } from "@tanstack/react-query";
import { intentPath } from "lib/claimVote/intent";
import { voteIntentStore } from "lib/claimVote/storage";
import { toXClaimFailure } from "lib/xClaim/client";
import type { XClaimActions, XClaimWallet } from "lib/xClaim/types";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { xClaimKeys } from "./queries";
import { xClaimAction, xClaimSheet } from "./store";

export const useXClaimActions = ({ wallet }: { wallet: XClaimWallet }): XClaimActions => {
  const queryClient = useQueryClient();
  const { openModal } = useModal();
  const createAccount = useEmbeddedOnlySignIn();
  const router = useRouter();

  const backToVote = useCallback(async () => {
    const intent = voteIntentStore.read();
    xClaimSheet.close();
    if (intent && window.location.pathname.toLowerCase() !== intentPath(intent)) router.push(intentPath(intent));
  }, [router]);

  const checkStatus = useCallback(async () => {
    if (wallet.kind !== "embedded" || xClaimAction.isBusy()) return;
    const run = xClaimAction.begin("check_status", "submitting");
    try {
      await queryClient.refetchQueries({ queryKey: xClaimKeys.me(wallet.address) }, { throwOnError: true });
      xClaimAction.finish(run);
    } catch (error) {
      xClaimAction.fail(run, "check_status", toXClaimFailure(error));
    }
  }, [wallet, queryClient]);

  return useMemo(
    () => ({
      open: xClaimSheet.open,
      close: xClaimSheet.close,
      signIn: () => openModal(),
      createAccount,
      startXClaim: backToVote,
      retryClaim: backToVote,
      checkStatus,
    }),
    [openModal, createAccount, backToVote, checkStatus],
  );
};
