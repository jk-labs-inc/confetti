import { create } from "zustand";
import {
  TransactionOverlayFlow,
  TransactionOverlayPhase,
  TransactionOverlayPlacement,
  TransactionOverlayStep,
  TransactionOverlaySuccessMeta,
  TransactionOverlayVoteShare,
} from "./types";

export interface TransactionOverlayState {
  isOpen: boolean;
  placement: TransactionOverlayPlacement;
  flow: TransactionOverlayFlow;
  phase: TransactionOverlayPhase;
  errorMessage: string;
  steps: TransactionOverlayStep[];
  successMeta: TransactionOverlaySuccessMeta | null;
  voteShare: TransactionOverlayVoteShare | null;
}

export const useTransactionOverlayStore = create<TransactionOverlayState>(() => ({
  isOpen: false,
  placement: TransactionOverlayPlacement.FULLSCREEN,
  flow: TransactionOverlayFlow.ENTRY,
  phase: TransactionOverlayPhase.SIGNING,
  errorMessage: "",
  steps: [],
  successMeta: null,
  voteShare: null,
}));

type TransactionOverlayUpdate =
  | Partial<TransactionOverlayState>
  | ((state: TransactionOverlayState) => Partial<TransactionOverlayState>);

const setIfOpen = (update: TransactionOverlayUpdate) => {
  if (useTransactionOverlayStore.getState().isOpen) {
    useTransactionOverlayStore.setState(update);
  }
};

export const isInlineOverlayShowing = (state: TransactionOverlayState): boolean =>
  state.isOpen && state.placement === TransactionOverlayPlacement.INLINE;

export const isInlineOverlayInFlow = (state: TransactionOverlayState): boolean =>
  isInlineOverlayShowing(state) &&
  state.flow === TransactionOverlayFlow.VOTE &&
  state.phase === TransactionOverlayPhase.SUCCESS;

export const txOverlay = {
  isShowing: (flow: TransactionOverlayFlow) => {
    const state = useTransactionOverlayStore.getState();
    return state.isOpen && state.flow === flow;
  },

  start: (flow: TransactionOverlayFlow, options?: { steps?: string[]; placement?: TransactionOverlayPlacement }) => {
    useTransactionOverlayStore.setState({
      isOpen: true,
      placement: options?.placement ?? TransactionOverlayPlacement.FULLSCREEN,
      flow,
      phase: TransactionOverlayPhase.SIGNING,
      errorMessage: "",
      successMeta: null,
      voteShare: null,
      steps: (options?.steps ?? []).map((label, index) => ({
        label,
        status: index === 0 ? "active" : "pending",
      })),
    });
  },

  setPhase: (phase: TransactionOverlayPhase) => {
    setIfOpen({ phase });
  },

  setActiveStep: (index: number) => {
    setIfOpen(state => ({
      steps: state.steps.map((step, i) => ({
        ...step,
        status: i < index ? "completed" : i === index ? "active" : "pending",
      })),
    }));
  },

  success: (meta?: TransactionOverlaySuccessMeta, voteShare?: TransactionOverlayVoteShare) => {
    setIfOpen({ phase: TransactionOverlayPhase.SUCCESS, successMeta: meta ?? null, voteShare: voteShare ?? null });
  },

  fail: (message: string) => {
    setIfOpen({ phase: TransactionOverlayPhase.ERROR, errorMessage: message });
  },

  dismiss: () => {
    useTransactionOverlayStore.setState({ isOpen: false });
  },
};
