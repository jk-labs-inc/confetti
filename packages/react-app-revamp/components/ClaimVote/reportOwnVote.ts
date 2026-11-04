import { voteFailureLine } from "@components/ClaimVote/copy";
import { toastError, toastSuccess } from "@components/UI/Toast";
import { txOverlay } from "@components/UI/TransactionOverlay/store";
import { TransactionOverlayFlow } from "@components/UI/TransactionOverlay/types";
import { useVotingStore } from "@components/Voting/store";
import type { VoteOutcome } from "lib/claimVote/types";

const OWN_VOTE_LANDED = "your votes have been deployed successfully";

export const reportFallbackFailure = (outcome: VoteOutcome) => {
  if (outcome.kind === "failed" && outcome.failure.kind !== "cannot_afford") {
    toastError({ message: voteFailureLine(outcome.failure) });
  }
};

export const reportOwnVote = (outcome: VoteOutcome) => {
  const isOverlayShowing = txOverlay.isShowing(TransactionOverlayFlow.VOTE);
  if (outcome.kind === "already_voted") {
    useVotingStore.getState().reset();
    if (isOverlayShowing) txOverlay.success();
    else toastSuccess({ message: OWN_VOTE_LANDED });
    return;
  }
  if (outcome.kind !== "failed" || outcome.isShown) return;
  const message = voteFailureLine(outcome.failure);
  if (isOverlayShowing) txOverlay.fail(message);
  else toastError({ message });
};
