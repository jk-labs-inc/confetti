import {
  TransactionOverlayFlow,
  TransactionOverlayPendingPhase,
  TransactionOverlayPhase,
  TransactionOverlayPlacement,
} from "./types";

export interface TransactionOverlayPhaseCopy {
  title: string;
  sub: string;
}

const KEEP_OPEN_SUB: Record<TransactionOverlayPlacement, string> = {
  [TransactionOverlayPlacement.FULLSCREEN]: "please don't close this screen",
  [TransactionOverlayPlacement.INLINE]: "please don't close your browser",
};

interface PhaseCopyEntry {
  title: string;
  sub: string | Record<TransactionOverlayPlacement, string>;
}

const PHASE_COPY: Record<TransactionOverlayFlow, Record<TransactionOverlayPendingPhase, PhaseCopyEntry>> = {
  [TransactionOverlayFlow.ENTRY]: {
    [TransactionOverlayPhase.SIGNING]: {
      title: "check your wallet",
      sub: "sign the transaction to submit your entry",
    },
    [TransactionOverlayPhase.MINING]: {
      title: "deploying your entry",
      sub: KEEP_OPEN_SUB,
    },
    [TransactionOverlayPhase.INDEXING]: {
      title: "saving your entry",
      sub: KEEP_OPEN_SUB,
    },
  },
  [TransactionOverlayFlow.VOTE]: {
    [TransactionOverlayPhase.SIGNING]: {
      title: "check your wallet",
      sub: "sign the transaction to buy your votes",
    },
    [TransactionOverlayPhase.MINING]: {
      title: "deploying your votes",
      sub: KEEP_OPEN_SUB,
    },
    [TransactionOverlayPhase.INDEXING]: {
      title: "saving your votes",
      sub: KEEP_OPEN_SUB,
    },
  },
  [TransactionOverlayFlow.REWARDS]: {
    [TransactionOverlayPhase.SIGNING]: {
      title: "funding rewards",
      sub: "check wallet to sign all transactions",
    },
    [TransactionOverlayPhase.MINING]: {
      title: "funding rewards",
      sub: KEEP_OPEN_SUB,
    },
    [TransactionOverlayPhase.INDEXING]: {
      title: "funding rewards",
      sub: KEEP_OPEN_SUB,
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
  placement: TransactionOverlayPlacement,
): TransactionOverlayPhaseCopy => {
  const { title, sub } = PHASE_COPY[flow][phase];

  return { title, sub: typeof sub === "string" ? sub : sub[placement] };
};

export const getSuccessCopy = (flow: TransactionOverlayFlow): string => SUCCESS_COPY[flow];
