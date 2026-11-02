import { create } from "zustand";

interface ParaSignInState {
  isEmbeddedOnly: boolean;
  setIsEmbeddedOnly: (value: boolean) => void;
}

export const useParaSignInStore = create<ParaSignInState>(set => ({
  isEmbeddedOnly: false,
  setIsEmbeddedOnly: value => set({ isEmbeddedOnly: value }),
}));
