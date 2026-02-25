import { create } from "zustand";
import { AddFundsProviderType } from "../providers";

interface AddFundsStore {
  providerType: AddFundsProviderType;
  expandedCards: Record<string, boolean>;
  setProviderType: (type: AddFundsProviderType) => void;
  toggleCard: (cardName: string) => void;
  setCardExpanded: (cardName: string, expanded: boolean) => void;
  isCardExpanded: (cardName: string) => boolean;
}

export const useAddFundsStore = create<AddFundsStore>((set, get) => ({
  providerType: AddFundsProviderType.ONRAMP,
  expandedCards: {},

  setProviderType: (type: AddFundsProviderType) => set({ providerType: type }),

  toggleCard: (cardName: string) =>
    set(state => ({
      expandedCards: {
        ...state.expandedCards,
        [cardName]: !state.expandedCards[cardName],
      },
    })),

  setCardExpanded: (cardName: string, expanded: boolean) =>
    set(state => ({
      expandedCards: {
        ...state.expandedCards,
        [cardName]: expanded,
      },
    })),

  isCardExpanded: (cardName: string) => !!get().expandedCards[cardName],
}));
