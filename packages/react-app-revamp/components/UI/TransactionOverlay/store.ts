import { create } from "zustand";
import {
  TransactionOverlayFlow,
  TransactionOverlayPhase,
  TransactionOverlayStep,
  TransactionOverlaySuccessMeta,
} from "./types";

interface TransactionOverlayState {
  isOpen: boolean;
  flow: TransactionOverlayFlow;
  phase: TransactionOverlayPhase;
  errorMessage: string;
  steps: TransactionOverlayStep[];
  successMeta: TransactionOverlaySuccessMeta | null;
}

export const useTransactionOverlayStore = create<TransactionOverlayState>(() => ({
  isOpen: false,
  flow: TransactionOverlayFlow.ENTRY,
  phase: TransactionOverlayPhase.SIGNING,
  errorMessage: "",
  steps: [],
  successMeta: null,
}));

type TransactionOverlayUpdate =
  | Partial<TransactionOverlayState>
  | ((state: TransactionOverlayState) => Partial<TransactionOverlayState>);

const setIfOpen = (update: TransactionOverlayUpdate) => {
  if (useTransactionOverlayStore.getState().isOpen) {
    useTransactionOverlayStore.setState(update);
  }
};

export const txOverlay = {
  isActive: () => useTransactionOverlayStore.getState().isOpen,

  start: (flow: TransactionOverlayFlow, options?: { steps?: string[] }) => {
    useTransactionOverlayStore.setState({
      isOpen: true,
      flow,
      phase: TransactionOverlayPhase.SIGNING,
      errorMessage: "",
      successMeta: null,
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

  success: (meta?: TransactionOverlaySuccessMeta) => {
    setIfOpen({ phase: TransactionOverlayPhase.SUCCESS, successMeta: meta ?? null });
  },

  fail: (message: string) => {
    setIfOpen({ phase: TransactionOverlayPhase.ERROR, errorMessage: message });
  },

  dismiss: () => {
    useTransactionOverlayStore.setState({ isOpen: false });
  },
};
