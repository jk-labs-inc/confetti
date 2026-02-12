import { create } from "zustand";
import { loadFromLocalStorage, saveToLocalStorage } from "@helpers/localStorage";

export type DisplayCurrency = "native" | "usd";

const STORAGE_KEY = "currency-preference";

interface CurrencyState {
  displayCurrency: DisplayCurrency;
  toggleCurrency: () => void;
}

const getInitialCurrency = (): DisplayCurrency => {
  if (typeof window === "undefined") return "usd";
  const stored = loadFromLocalStorage<{ value: DisplayCurrency }>(STORAGE_KEY, { value: "usd" });
  return stored.value;
};

export const useCurrencyStore = create<CurrencyState>(set => ({
  displayCurrency: getInitialCurrency(),
  toggleCurrency: () =>
    set(state => {
      const next: DisplayCurrency = state.displayCurrency === "native" ? "usd" : "native";
      saveToLocalStorage(STORAGE_KEY, { value: next });
      return { displayCurrency: next };
    }),
}));
