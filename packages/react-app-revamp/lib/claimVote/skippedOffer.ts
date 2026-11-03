import { loadFromLocalStorage, saveToLocalStorage } from "@helpers/localStorage";

const SKIPPED_KEY = "claim_vote.v1.offer_skipped_wallets";

export const readSkippedWallets = (): string[] => {
  try {
    const { wallets } = loadFromLocalStorage<{ wallets?: unknown }>(SKIPPED_KEY);
    return Array.isArray(wallets) ? wallets.filter(wallet => typeof wallet === "string") : [];
  } catch {
    return [];
  }
};

export const rememberSkippedWallet = (wallet: string): string[] => {
  const wallets = [...new Set([...readSkippedWallets(), wallet.toLowerCase()])];
  try {
    saveToLocalStorage(SKIPPED_KEY, { wallets });
  } catch {
    return wallets;
  }
  return wallets;
};
