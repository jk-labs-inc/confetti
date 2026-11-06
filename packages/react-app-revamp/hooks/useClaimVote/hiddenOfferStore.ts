import { readHiddenOfferWallets, saveHiddenOfferWallets } from "lib/claimVote/hiddenOffer";
import { create } from "zustand";

interface HiddenOfferState {
  wallets: string[];
  hide: (wallet: string) => void;
  show: (wallet: string) => void;
}

const saved = (wallets: string[]) => {
  saveHiddenOfferWallets(wallets);
  return { wallets };
};

const latest = (known: string[]) => [...new Set([...readHiddenOfferWallets(), ...known])];

export const useHiddenOfferStore = create<HiddenOfferState>((set, get) => ({
  wallets: readHiddenOfferWallets(),
  hide: wallet => set(saved(latest([...get().wallets, wallet.toLowerCase()]))),
  show: wallet => set(saved(latest(get().wallets).filter(hidden => hidden !== wallet.toLowerCase()))),
}));
