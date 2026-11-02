import React, { createContext, useContext, useRef } from "react";
import { createStore, useStore } from "zustand";

interface CastVotesState {
  pickedProposal: string | null;
  isModalOpen: boolean;
  transactionData: any;
  castPositiveAmountOfVotes: boolean;
  setTransactionData: (value: any) => void;
  setPickedProposal: (value: string | null) => void;
  setIsModalOpen: (value: boolean) => void;
  setCastPositiveAmountOfVotes: (value: boolean) => void;
  resetStore: () => void;
}

const initialState = {
  pickedProposal: null as string | null,
  isModalOpen: false,
  transactionData: null,
  castPositiveAmountOfVotes: true,
};

export const createCastVotesStore = (initialPickedProposal: string | null = null) =>
  createStore<CastVotesState>(set => ({
    ...initialState,
    pickedProposal: initialPickedProposal,
    setTransactionData: value => set({ transactionData: value }),
    setPickedProposal: value => set({ pickedProposal: value }),
    setIsModalOpen: value => set({ isModalOpen: value }),
    setCastPositiveAmountOfVotes: value => set({ castPositiveAmountOfVotes: value }),
    resetStore: () => set(initialState),
  }));

export const CastVotesContext = createContext<ReturnType<typeof createCastVotesStore> | null>(null);

export function CastVotesWrapper({
  children,
  initialPickedProposal = null,
}: {
  children: React.ReactNode;
  initialPickedProposal?: string | null;
}) {
  const storeRef = useRef<ReturnType<typeof createCastVotesStore>>(createCastVotesStore(initialPickedProposal));
  return <CastVotesContext.Provider value={storeRef.current}>{children}</CastVotesContext.Provider>;
}

export function useCastVotesStore<T>(selector: (state: CastVotesState) => T) {
  const store = useContext(CastVotesContext);
  if (store === null) {
    throw new Error("Missing CastVotesWrapper in the tree");
  }
  const value = useStore(store, selector);
  return value;
}
