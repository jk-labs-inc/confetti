import { create } from "zustand";

interface HowItWorksState {
  isOpen: boolean;
  openCount: number;
  open: () => void;
  close: () => void;
}

export const useHowItWorksStore = create<HowItWorksState>(set => ({
  isOpen: false,
  openCount: 0,
  open: () => set(state => (state.isOpen ? state : { isOpen: true, openCount: state.openCount + 1 })),
  close: () => set(state => (state.isOpen ? { isOpen: false } : state)),
}));
