import { loadFromLocalStorage, saveToLocalStorage } from "@helpers/localStorage";

const HIDDEN_KEY = "claim_vote.v1.offer_hidden_wallets";

export const readHiddenOfferWallets = (): string[] => {
  try {
    const { wallets } = loadFromLocalStorage<{ wallets?: unknown }>(HIDDEN_KEY);
    return Array.isArray(wallets) ? wallets.filter(wallet => typeof wallet === "string") : [];
  } catch {
    return [];
  }
};

export const saveHiddenOfferWallets = (wallets: string[]) => {
  try {
    saveToLocalStorage(HIDDEN_KEY, { wallets });
  } catch {
    return;
  }
};
