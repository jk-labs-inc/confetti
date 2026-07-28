import { TransactionOverlayFlow, TransactionOverlayPendingPhase, TransactionOverlayPhase } from "./types";

export interface TransactionOverlayPhaseCopy {
  title: string;
  sub: string;
}

const PHASE_COPY: Record<
  TransactionOverlayFlow,
  Record<TransactionOverlayPendingPhase, TransactionOverlayPhaseCopy>
> = {
  [TransactionOverlayFlow.ENTRY]: {
    [TransactionOverlayPhase.SIGNING]: {
      title: "check your wallet",
      sub: "sign the transaction to submit your entry",
    },
    [TransactionOverlayPhase.MINING]: {
      title: "deploying your entry",
      sub: "please don't close this screen",
    },
    [TransactionOverlayPhase.INDEXING]: {
      title: "saving your entry",
      sub: "please don't close this screen",
    },
  },
  [TransactionOverlayFlow.VOTE]: {
    [TransactionOverlayPhase.SIGNING]: {
      title: "check your wallet",
      sub: "sign the transaction to buy your votes",
    },
    [TransactionOverlayPhase.MINING]: {
      title: "deploying your votes",
      sub: "please don't close this screen",
    },
    [TransactionOverlayPhase.INDEXING]: {
      title: "locking in your votes",
      sub: "please don't close this screen",
    },
  },
  [TransactionOverlayFlow.REWARDS]: {
    [TransactionOverlayPhase.SIGNING]: {
      title: "funding rewards",
      sub: "check wallet to sign all transactions",
    },
    [TransactionOverlayPhase.MINING]: {
      title: "funding rewards",
      sub: "please don't close this screen",
    },
    [TransactionOverlayPhase.INDEXING]: {
      title: "funding rewards",
      sub: "please don't close this screen",
    },
  },
};

const SUCCESS_COPY: Record<TransactionOverlayFlow, string> = {
  [TransactionOverlayFlow.ENTRY]: "you're in",
  [TransactionOverlayFlow.VOTE]: "votes are in",
  [TransactionOverlayFlow.REWARDS]: "rewards funded",
};

export const getPendingPhaseCopy = (
  flow: TransactionOverlayFlow,
  phase: TransactionOverlayPendingPhase,
): TransactionOverlayPhaseCopy => PHASE_COPY[flow][phase];

export const getSuccessCopy = (flow: TransactionOverlayFlow): string => SUCCESS_COPY[flow];
