import { isXClaimConfigured } from "@config/xClaim";
import { PENDING_POLL_WINDOW_MS, SIGN_IN_ARM_GRACE_MS } from "lib/xClaim/constants";
import type { XClaimSignInHandoff } from "lib/xClaim/handoff";
import { memoryAfterHint, readMemory, writeMemory } from "lib/xClaim/memory";
import type {
  XClaimActionName,
  XClaimActionStage,
  XClaimFailure,
  XClaimFlowAction,
  XClaimFlowResult,
  XClaimMemory,
  XClaimOffer,
  XClaimResult,
} from "lib/xClaim/types";
import { create } from "zustand";
import { shallow } from "zustand/shallow";

interface XClaimStoreState {
  isOpen: boolean;
  result: XClaimFlowResult | null;
  action: XClaimFlowAction;
  actionRun: number;
  pollUntil: number | null;
  memory: { address: string; state: XClaimMemory | null } | null;
  signIn: { armed: boolean; modalClosedAt: number | null; pending: boolean };
  offer: XClaimOffer;
}

type BusyStage = Exclude<XClaimActionStage, "idle">;

interface ParaAuthEvent {
  detail?: { error?: unknown };
}

const IDLE_ACTION: XClaimFlowAction = { name: null, stage: "idle", error: null };

const IDLE_SIGN_IN: XClaimStoreState["signIn"] = { armed: false, modalClosedAt: null, pending: false };

export const useXClaimStore = create<XClaimStoreState>(() => ({
  isOpen: false,
  result: null,
  action: IDLE_ACTION,
  actionRun: 0,
  pollUntil: null,
  memory: null,
  signIn: IDLE_SIGN_IN,
  offer: { status: "off", reason: isXClaimConfigured ? "loading" : "not_configured" },
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

  land: ({ result, at, startedBy }: { result: XClaimResult; at: number; startedBy: string | null }) =>
    useXClaimStore.setState(state => ({
      isOpen: true,
      result: { result, source: "redirect", at, walletWaitOver: false, startedBy },
      action: IDLE_ACTION,
      actionRun: state.actionRun + 1,
      pollUntil: pollWindowFor(result, at),
    })),

  endWalletWait: () => {
    const { result } = useXClaimStore.getState();
    if (result && !result.walletWaitOver) useXClaimStore.setState({ result: { ...result, walletWaitOver: true } });
  },

  reset: () => useXClaimStore.setState(state => ({ ...closeFlow(state), memory: null })),
};

export const xClaimAction = {
  isBusy: () => useXClaimStore.getState().action.stage !== "idle",

  isCurrent: isCurrentRun,

  begin: (name: XClaimActionName, stage: BusyStage) => {
    const run = useXClaimStore.getState().actionRun + 1;
    useXClaimStore.setState({ action: { name, stage, error: null }, actionRun: run });
    return run;
  },

  advance: (run: number, stage: BusyStage) => {
    const { action } = useXClaimStore.getState();
    if (isCurrentRun(run)) useXClaimStore.setState({ action: { ...action, stage } });
  },

  finish: (run: number) => {
    if (isCurrentRun(run)) useXClaimStore.setState({ action: IDLE_ACTION });
  },

  fail: (run: number, name: XClaimActionName, failure: XClaimFailure) => {
    if (isCurrentRun(run)) useXClaimStore.setState({ action: { name, stage: "idle", error: failure } });
  },

  reject: (name: XClaimActionName, failure: XClaimFailure) =>
    useXClaimStore.setState(state => ({
      action: { name, stage: "idle", error: failure },
      actionRun: state.actionRun + 1,
    })),

  recordResult: (run: number, result: XClaimResult, at: number) => {
    if (!isCurrentRun(run)) return;
    useXClaimStore.setState({
      result: { result, source: "worker", at, walletWaitOver: true, startedBy: null },
      pollUntil: pollWindowFor(result, at),
    });
  },

  dropResult: (run: number) => {
    if (isCurrentRun(run)) useXClaimStore.setState({ result: null, pollUntil: null });
  },

  clearRedirecting: () => {
    if (useXClaimStore.getState().action.stage === "redirecting") {
      useXClaimStore.setState(state => ({ action: IDLE_ACTION, actionRun: state.actionRun + 1 }));
    }
  },
};

export const xClaimMemory = {
  load: (address: string) => useXClaimStore.setState({ memory: { address, state: readMemory(address) } }),

  set: (address: string, state: XClaimMemory | null) => {
    writeMemory(address, state);
    const { memory } = useXClaimStore.getState();
    if (!memory || memory.address === address) useXClaimStore.setState({ memory: { address, state } });
  },

  mergeHint: (address: string, hint: XClaimResult) => {
    const { memory } = useXClaimStore.getState();
    const current = memory?.address === address ? memory.state : readMemory(address);
    const next = memoryAfterHint(current, hint);
    if (next !== current) xClaimMemory.set(address, next);
  },
};

const recordAuthEvent = (payload: ParaAuthEvent) => {
  const { signIn } = useXClaimStore.getState();
  const failed = payload.detail?.error !== undefined;
  const withinGrace = signIn.modalClosedAt === null || Date.now() - signIn.modalClosedAt <= SIGN_IN_ARM_GRACE_MS;
  if (!failed && signIn.armed && withinGrace) useXClaimStore.setState({ signIn: { ...signIn, pending: true } });
};

export const xClaimSignIn = {
  arm: () => {
    const { signIn } = useXClaimStore.getState();
    if (!signIn.armed || signIn.modalClosedAt !== null) {
      useXClaimStore.setState({ signIn: { ...signIn, armed: true, modalClosedAt: null } });
    }
  },

  modalClosed: (now: number) => {
    const { signIn } = useXClaimStore.getState();
    if (signIn.armed && signIn.modalClosedAt === null) {
      useXClaimStore.setState({ signIn: { ...signIn, modalClosedAt: now } });
    }
  },

  consume: ({ openSheet }: { openSheet: boolean }) =>
    useXClaimStore.setState(state => ({ isOpen: state.isOpen || openSheet, signIn: IDLE_SIGN_IN })),
};

export const xClaimParaCallbacks = {
  onLogin: recordAuthEvent,
  onAccountCreation: recordAuthEvent,
};

const handoffOf = (state: XClaimStoreState): XClaimSignInHandoff => {
  if (state.signIn.pending) return "deciding";
  return state.isOpen ? "sheet_open" : "free";
};

export const takeOverXClaimSignIn = () =>
  useXClaimStore.setState(state => ({ ...(state.isOpen ? closeFlow(state) : {}), signIn: IDLE_SIGN_IN }));

export const useXClaimSignInHandoff = () => useXClaimStore(handoffOf);

export const publishXClaimOffer = (offer: XClaimOffer) => {
  if (!shallow(useXClaimStore.getState().offer, offer)) useXClaimStore.setState({ offer });
};

export const useXClaimOffer = () => useXClaimStore(state => state.offer);
