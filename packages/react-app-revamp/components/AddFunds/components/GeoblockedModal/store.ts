import { isAnyDrawerOpen } from "@components/UI/Drawer";
import { create } from "zustand";

type GeoblockedModalSurface = "closed" | "dialog" | "sheet";

interface GeoblockedModalState {
  surface: GeoblockedModalSurface;
}

export const useGeoblockedModalStore = create<GeoblockedModalState>(() => ({
  surface: "closed",
}));

export const geoblockedModal = {
  show: () => {
    if (useGeoblockedModalStore.getState().surface !== "closed") return;
    useGeoblockedModalStore.setState({ surface: isAnyDrawerOpen() ? "sheet" : "dialog" });
  },

  dismiss: () => {
    useGeoblockedModalStore.setState({ surface: "closed" });
  },
};
