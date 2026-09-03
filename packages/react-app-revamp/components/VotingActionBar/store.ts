import { create } from "zustand";

interface VotingFocusModeState {
  isFocusMode: boolean;
  setIsFocusMode: (value: boolean) => void;
}

export const useVotingFocusModeStore = create<VotingFocusModeState>(set => ({
  isFocusMode: false,
  setIsFocusMode: value => set({ isFocusMode: value }),
}));
