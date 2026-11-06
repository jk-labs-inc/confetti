import { readWalletHintDismissed, rememberWalletHintDismissed } from "lib/claimVote/walletHint";
import { create } from "zustand";

interface WalletHintState {
  isDismissed: boolean;
  dismiss: () => void;
}

export const useWalletHintStore = create<WalletHintState>(set => ({
  isDismissed: readWalletHintDismissed(),
  dismiss: () => {
    rememberWalletHintDismissed();
    set({ isDismissed: true });
  },
}));
