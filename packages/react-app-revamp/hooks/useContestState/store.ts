import { create } from "zustand";
import { ContestStateEnum } from "./types";

export { ContestStateEnum };

type Store = {
  contestState: ContestStateEnum;
  setContestState: (state: ContestStateEnum) => void;
};

export const useContestStateStore = create<Store>(set => ({
  contestState: ContestStateEnum.NotStarted,
  setContestState: (state: ContestStateEnum) => set({ contestState: state }),
}));
