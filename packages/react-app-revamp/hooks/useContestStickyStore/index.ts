import { create } from "zustand";

interface ContestStickyState {
  isCompact: boolean;
  isPastRewards: boolean;
  isPastChart: boolean;
  setIsCompact: (value: boolean) => void;
  setIsPastRewards: (value: boolean) => void;
  setIsPastChart: (value: boolean) => void;
  reset: () => void;
}

export const useContestStickyStore = create<ContestStickyState>(set => ({
  isCompact: false,
  isPastRewards: false,
  isPastChart: false,
  setIsCompact: value => set({ isCompact: value }),
  setIsPastRewards: value => set({ isPastRewards: value }),
  setIsPastChart: value => set({ isPastChart: value }),
  reset: () => set({ isCompact: false, isPastRewards: false, isPastChart: false }),
}));
