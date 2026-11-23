import { toastLoading } from "@components/UI/Toast";
import { LoadingToastMessageType } from "@components/UI/Toast/components/Loading";
import { VOTE_FLOW_TRACKING_ID } from "@components/UI/TransactionOverlay/constants";
import { getVoteApprovalSteps, VOTE_STEP_AFTER_APPROVAL } from "@components/UI/TransactionOverlay/copy";
import { txOverlay } from "@components/UI/TransactionOverlay/store";
import { TransactionOverlayPlacement } from "@components/UI/TransactionOverlay/types";

export const showVotesDeployingToast = () => {
  toastLoading({
    id: VOTE_FLOW_TRACKING_ID,
    message: "votes are deploying...",
    additionalMessageType: LoadingToastMessageType.KEEP_BROWSER_OPEN,
  });
};

export const showApprovalStep = (overlayPlacement: TransactionOverlayPlacement | null, voteCurrencySymbol: string) => {
  if (overlayPlacement) {
    txOverlay.setSteps(getVoteApprovalSteps(voteCurrencySymbol));
    return;
  }

  toastLoading({
    message: `approving ${voteCurrencySymbol} for your votes...`,
    additionalMessageType: LoadingToastMessageType.WALLET_SIGNATURE,
  });
};

export const showVoteStepAfterApproval = (overlayPlacement: TransactionOverlayPlacement | null) => {
  if (overlayPlacement) {
    txOverlay.setActiveStep(VOTE_STEP_AFTER_APPROVAL);
    return;
  }

  showVotesDeployingToast();
};
