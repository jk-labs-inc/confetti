import { voteIntentStore } from "lib/claimVote/storage";
import { IDLE_RUN, transition } from "lib/claimVote/transition";
import type { ClaimVoteEvent, ClaimVoteRun, IntentCommand } from "lib/claimVote/types";
import { createContext, ReactNode, useContext, useRef } from "react";
import { createStore, StoreApi, useStore } from "zustand";

interface ClaimVoteState {
  run: ClaimVoteRun;
  step: number;
  begun: number;
  modalOpen: boolean;
  dispatch: (event: ClaimVoteEvent) => void;
  begin: (step: number) => boolean;
  isCurrent: (step: number) => boolean;
}

type ClaimVoteStore = StoreApi<ClaimVoteState>;

const applyIntentCommand = (command: IntentCommand) => {
  switch (command.kind) {
    case "keep":
      return;
    case "save":
      voteIntentStore.save(command.intent);
      return;
    case "touch":
      voteIntentStore.update({ savedAt: Date.now() });
      return;
    case "clear":
      voteIntentStore.clear();
      return;
    default: {
      const exhaustive: never = command;
      return exhaustive;
    }
  }
};

const createClaimVoteStore = (): ClaimVoteStore =>
  createStore<ClaimVoteState>((set, get) => ({
    run: IDLE_RUN,
    step: 0,
    begun: 0,
    modalOpen: false,
    dispatch: event => {
      const state = get();
      const next = transition(state.run, event, Date.now());
      if (!next) return;
      applyIntentCommand(next.intent);
      set({
        run: next.run,
        step: next.run === state.run ? state.step : state.step + 1,
        modalOpen: next.modal === "keep" ? state.modalOpen : next.modal === "open",
      });
    },
    begin: step => {
      if (get().begun >= step) return false;
      set({ begun: step });
      return true;
    },
    isCurrent: step => get().step === step,
  }));

const DETACHED_STORE = createClaimVoteStore();

const ClaimVoteStoreContext = createContext<ClaimVoteStore | null>(null);

export const ClaimVoteStoreProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<ClaimVoteStore | null>(null);
  storeRef.current ??= createClaimVoteStore();
  return <ClaimVoteStoreContext.Provider value={storeRef.current}>{children}</ClaimVoteStoreContext.Provider>;
};

export const useHasClaimVoteRun = () => useContext(ClaimVoteStoreContext) !== null;

export const useClaimVoteStore = <T,>(selector: (state: ClaimVoteState) => T): T =>
  useStore(useContext(ClaimVoteStoreContext) ?? DETACHED_STORE, selector);
