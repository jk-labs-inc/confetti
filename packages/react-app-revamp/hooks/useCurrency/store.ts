import { create } from "zustand";

export type DisplayCurrency = "native" | "usd";

interface CurrencyState {
  displayCurrency: DisplayCurrency;
  toggleCurrency: () => void;
}

export const useCurrencyStore = create<CurrencyState>(set => ({
  displayCurrency: "usd",
  toggleCurrency: () =>
    set(state => ({
      displayCurrency: state.displayCurrency === "native" ? "usd" : "native",
    })),
}));
