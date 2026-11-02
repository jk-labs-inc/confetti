import { PENDING_POLL_WINDOW_MS } from "lib/xClaim/constants";
import type {
  XClaimActionName,
  XClaimActionStage,
  XClaimFailure,
  XClaimFlowAction,
  XClaimFlowResult,
  XClaimResult,
} from "lib/xClaim/types";
import { create } from "zustand";

interface XClaimStoreState {
  isOpen: boolean;
  result: XClaimFlowResult | null;
  action: XClaimFlowAction;
  actionRun: number;
  pollUntil: number | null;
}

type BusyStage = Exclude<XClaimActionStage, "idle">;

const IDLE_ACTION: XClaimFlowAction = { name: null, stage: "idle", error: null };

export const useXClaimStore = create<XClaimStoreState>(() => ({
  isOpen: false,
  result: null,
  action: IDLE_ACTION,
  actionRun: 0,
  pollUntil: null,
}));

const pollWindowFor = (result: XClaimResult, at: number) =>
  result.kind === "pending" ? at + PENDING_POLL_WINDOW_MS : null;

const closeFlow = (state: XClaimStoreState) => ({
  isOpen: false,
  result: null,
  action: IDLE_ACTION,
  actionRun: state.actionRun + 1,
  pollUntil: null,
});

const isCurrentRun = (run: number) => useXClaimStore.getState().actionRun === run;

export const xClaimSheet = {
  open: () => useXClaimStore.setState({ isOpen: true }),

  close: () => useXClaimStore.setState(closeFlow),

  land: ({ result, at }: { result: XClaimResult; at: number }) =>
    useXClaimStore.setState(state => ({
      isOpen: true,
      result: { result, at, walletWaitOver: false },
      action: IDLE_ACTION,
      actionRun: state.actionRun + 1,
      pollUntil: pollWindowFor(result, at),
    })),

  endWalletWait: () => {
    const { result } = useXClaimStore.getState();
    if (result && !result.walletWaitOver) useXClaimStore.setState({ result: { ...result, walletWaitOver: true } });
  },

  reset: () => useXClaimStore.setState(closeFlow),
};

export const xClaimAction = {
  isBusy: () => useXClaimStore.getState().action.stage !== "idle",

  begin: (name: XClaimActionName, stage: BusyStage) => {
    const run = useXClaimStore.getState().actionRun + 1;
    useXClaimStore.setState({ action: { name, stage, error: null }, actionRun: run });
    return run;
  },

  finish: (run: number) => {
    if (isCurrentRun(run)) useXClaimStore.setState({ action: IDLE_ACTION });
  },

  fail: (run: number, name: XClaimActionName, failure: XClaimFailure) => {
    if (isCurrentRun(run)) useXClaimStore.setState({ action: { name, stage: "idle", error: failure } });
  },
};
