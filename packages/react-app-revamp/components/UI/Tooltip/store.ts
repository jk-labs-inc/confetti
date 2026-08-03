import { create } from "zustand";

interface ActiveTooltipStore {
  activeId: string | null;
  open: (id: string) => void;
  close: (id: string) => void;
}

export const useActiveTooltipStore = create<ActiveTooltipStore>(set => ({
  activeId: null,
  open: (id: string) => set({ activeId: id }),
  close: (id: string) => set(state => (state.activeId === id ? { activeId: null } : state)),
}));
