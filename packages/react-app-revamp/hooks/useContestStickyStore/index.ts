import { create } from "zustand";

interface ContestStickyState {
  isCompact: boolean;
  setIsCompact: (value: boolean) => void;
  reset: () => void;
}

export const useContestStickyStore = create<ContestStickyState>(set => ({
  isCompact: false,
  setIsCompact: value => set({ isCompact: value }),
  reset: () => set({ isCompact: false }),
}));
