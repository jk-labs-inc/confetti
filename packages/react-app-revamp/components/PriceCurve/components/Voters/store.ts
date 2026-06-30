import { create } from "zustand";

interface VoterRibbonStore {
  activeVoteUuid: string | null;
  setActiveVoteUuid: (uuid: string | null) => void;
}

const useVoterRibbonStore = create<VoterRibbonStore>(set => ({
  activeVoteUuid: null,
  setActiveVoteUuid: uuid => set({ activeVoteUuid: uuid }),
}));

export default useVoterRibbonStore;
