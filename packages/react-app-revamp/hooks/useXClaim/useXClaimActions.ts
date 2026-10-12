import { useQueryClient } from "@tanstack/react-query";
import { fetchClaimMe, startXLogin, submitClaim, toXClaimFailure, XClaimError } from "lib/xClaim/client";
import { memoryFromMe, memoryFromWorkerResult, rememberFlowStarter } from "lib/xClaim/memory";
import { safeReturnPath } from "lib/xClaim/outcomes";
import type { XClaimActionName, XClaimActions, XClaimSignedInWallet, XClaimWallet } from "lib/xClaim/types";
import { useCallback, useMemo } from "react";
import { xClaimKeys } from "./queries";
import { xClaimAction, xClaimMemory, xClaimSheet } from "./store";
import type { RunWithProof } from "./useWalletProof";

const CANCELLED = new XClaimError({ reason: "temporary", detail: "cancelled" });

const currentPath = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

export const useXClaimActions = ({
  wallet,
  runWithProof,
}: {
  wallet: XClaimWallet;
  runWithProof: RunWithProof;
}): XClaimActions => {
  const queryClient = useQueryClient();

  const begin = useCallback(
    (name: XClaimActionName): { signedIn: XClaimSignedInWallet; run: number } | null => {
      if (xClaimAction.isBusy()) return null;
      if (wallet.kind === "signed_out") {
        xClaimAction.reject(name, { reason: "signed_out", detail: "no wallet" });
        return null;
      }
      const run = xClaimAction.begin(name, wallet.kind === "external" ? "awaiting_signature" : "submitting");
      return { signedIn: wallet, run };
    },
    [wallet],
  );

  const provenFor = useCallback(
    (run: number) => () => {
      if (!xClaimAction.isCurrent(run)) throw CANCELLED;
      xClaimAction.advance(run, "submitting");
    },
    [],
  );

  const startXClaim = useCallback(
    async (returnPath?: string) => {
      const started = begin("start_x");
      if (!started) return;
      const { signedIn, run } = started;
      try {
        const { authorizeUrl } = await runWithProof({
          wallet: signedIn,
          call: proof =>
            startXLogin({
              proof,
              returnPath: safeReturnPath({ preferred: returnPath ?? currentPath(), fallback: window.location.pathname }),
            }),
          onProven: provenFor(run),
        });
        if (!xClaimAction.isCurrent(run)) return;
        xClaimAction.advance(run, "redirecting");
        rememberFlowStarter(signedIn.address);
        window.location.assign(authorizeUrl);
      } catch (error) {
        xClaimAction.fail(run, "start_x", toXClaimFailure(error));
      }
    },
    [begin, provenFor, runWithProof],
  );

  const retryClaim = useCallback(async () => {
    const started = begin("retry_claim");
    if (!started) return;
    const { signedIn, run } = started;
    try {
      const result = await runWithProof({ wallet: signedIn, call: submitClaim, onProven: provenFor(run) });
      if (signedIn.kind === "external") xClaimMemory.set(signedIn.address, memoryFromWorkerResult(result));
      xClaimAction.recordResult(run, result, Date.now());
      xClaimAction.finish(run);
    } catch (error) {
      const failure = toXClaimFailure(error);
      if (failure.reason === "not_linked") {
        xClaimMemory.set(signedIn.address, null);
        xClaimAction.dropResult(run);
      }
      xClaimAction.fail(run, "retry_claim", failure);
    } finally {
      queryClient.invalidateQueries({ queryKey: xClaimKeys.spots });
      if (signedIn.kind === "embedded") queryClient.invalidateQueries({ queryKey: xClaimKeys.me(signedIn.address) });
    }
  }, [begin, provenFor, queryClient, runWithProof]);

  const checkStatus = useCallback(async () => {
    const started = begin("check_status");
    if (!started) return;
    const { signedIn, run } = started;
    try {
      if (signedIn.kind === "embedded") {
        await queryClient.refetchQueries({ queryKey: xClaimKeys.me(signedIn.address) }, { throwOnError: true });
      } else {
        const me = await runWithProof({ wallet: signedIn, call: fetchClaimMe, onProven: provenFor(run) });
        queryClient.setQueryData(xClaimKeys.me(signedIn.address), me);
        xClaimMemory.set(signedIn.address, memoryFromMe(me));
      }
      xClaimAction.finish(run);
    } catch (error) {
      xClaimAction.fail(run, "check_status", toXClaimFailure(error));
    }
  }, [begin, provenFor, queryClient, runWithProof]);

  return useMemo(
    () => ({ open: xClaimSheet.open, close: xClaimSheet.close, startXClaim, retryClaim, checkStatus }),
    [startXClaim, retryClaim, checkStatus],
  );
};
