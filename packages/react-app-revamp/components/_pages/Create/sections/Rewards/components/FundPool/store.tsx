import { FilteredToken } from "@hooks/useTokenList";
import { create } from "zustand";

export interface FundPoolToken extends FilteredToken {
  id: string;
  amount: string;
}

export const getFundTokenKey = (token: Pick<FundPoolToken, "id">): `fund_${string}` => `fund_${token.id}`;

interface FundPoolState {
  tokenWidgets: FundPoolToken[];
  isError: boolean;
  setTokenWidgets: (widgets: FundPoolToken[]) => void;
  setIsError: (isError: boolean) => void;
  reset: () => void;
}

export const useFundPoolStore = create<FundPoolState>(set => ({
  tokenWidgets: [],
  isError: false,
  setTokenWidgets: (tokenWidgets: FundPoolToken[]) => set({ tokenWidgets }),
  setIsError: (isError: boolean) => set({ isError }),
  reset: () => set({ tokenWidgets: [], isError: false }),
}));
