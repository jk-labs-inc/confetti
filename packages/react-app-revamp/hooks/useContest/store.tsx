import { Charge } from "@hooks/useDeployContest/types";
import { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";

export enum ErrorType {
  RPC = "RPC",
  CONTRACT = "CONTRACT",
  IS_NOT_JOKERACE_CONTRACT = "IS_NOT_JOKERACE_CONTRACT",
  UNSUPPORTED_VERSION = "UNSUPPORTED_VERSION",
}

export interface ContestState {
  contestName: string;
  contestPrompt: string;
  contestAuthorEthereumAddress: string;
  submissionsOpen: Date;
  votesOpen: Date;
  votesClose: Date;
  isLoading: boolean;
  error: ErrorType | null;
  isSuccess: boolean;
  isV3: boolean;
  contestMaxProposalCount: number;
  contestMaxNumberSubmissionsPerUser: number;
  sortingEnabled: boolean;
  charge: Charge;
  isReadOnly: boolean;
  canEditTitleAndDescription: boolean;
  setSortingEnabled: (isAllowed: boolean) => void;
  setContestPrompt: (prompt: string) => void;
  setContestMaxProposalCount: (amount: number) => void;
  setContestMaxNumberSubmissionsPerUser: (amount: number) => void;
  setContestName: (name: string) => void;
  setContestAuthor: (address: string) => void;
  setSubmissionsOpen: (datetime: Date) => void;
  setVotesOpen: (datetime: Date) => void;
  setVotesClose: (datetime: Date) => void;
  setIsLoading: (value: boolean) => void;
  setError: (value: ErrorType | null) => void;
  setIsSuccess: (value: boolean) => void;
  setIsV3: (value: boolean) => void;
  setCharge: (charge: Charge) => void;
  setIsReadOnly: (value: boolean) => void;
  setCanEditTitleAndDescription: (value: boolean) => void;
  getTotalVotingMinutes: () => number;
  getCurrentVotingMinute: () => number;
}

export const createContestStore = () =>
  createStore<ContestState>((set, get) => ({
    contestName: "",
    contestPrompt: "",
    contestAuthorEthereumAddress: "",
    submissionsOpen: new Date(),
    votesOpen: new Date(),
    votesClose: new Date(),
    isLoading: true,
    error: null,
    charge: {
      percentageToRewards: 0,
      costToVote: 0,
    },
    isSuccess: false,
    contestMaxProposalCount: 0,
    contestMaxNumberSubmissionsPerUser: 0,
    sortingEnabled: false,
    isV3: false,
    isReadOnly: false,
    canEditTitleAndDescription: false,
    setSortingEnabled: isAllowed => set({ sortingEnabled: isAllowed }),
    setContestPrompt: prompt => set({ contestPrompt: prompt }),
    setContestMaxProposalCount: amount => set({ contestMaxProposalCount: amount }),
    setContestMaxNumberSubmissionsPerUser: amount => set({ contestMaxNumberSubmissionsPerUser: amount }),
    setIsV3: value => set({ isV3: value }),
    setIsReadOnly: value => set({ isReadOnly: value }),
    setContestName: name => set({ contestName: name }),
    setContestAuthor: address => set({ contestAuthorEthereumAddress: address }),
    setSubmissionsOpen: datetime => set({ submissionsOpen: datetime }),
    setVotesOpen: datetime => set({ votesOpen: datetime }),
    setVotesClose: datetime => set({ votesClose: datetime }),
    setIsLoading: value => set({ isLoading: value }),
    setError: value => set({ error: value }),
    setIsSuccess: value => set({ isSuccess: value }),
    setCharge: charge => set({ charge: charge }),
    setCanEditTitleAndDescription: value => set({ canEditTitleAndDescription: value }),
    getTotalVotingMinutes: () => {
      const state = get();
      const diffMs = state.votesClose.getTime() - state.votesOpen.getTime();
      return Math.floor(diffMs / (1000 * 60)); // Convert to minutes
    },

    getCurrentVotingMinute: () => {
      const state = get();
      const now = new Date();
      const diffMs = now.getTime() - state.votesOpen.getTime();
      const currentMinute = Math.floor(diffMs / (1000 * 60)); // Convert to minutes

      // Ensure we don't go below 0 or above total minutes
      const totalMinutes = state.getTotalVotingMinutes();
      return Math.max(0, Math.min(currentMinute, totalMinutes));
    },
  }));

export const ContestContext = createContext<ReturnType<typeof createContestStore> | null>(null);

export function ContestWrapper({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof createContestStore>>(createContestStore());
  return <ContestContext.Provider value={storeRef.current}>{children}</ContestContext.Provider>;
}

export function useContestStore<T>(selector: (state: ContestState) => T) {
  const store = useContext(ContestContext);
  if (store === null) {
    throw new Error("Missing ContestWrapper in the tree");
  }
  const value = useStore(store, selector);
  return value;
}
