import { loadFromLocalStorage, saveToLocalStorage } from "@helpers/localStorage";

const DISMISSED_KEY = "claim_vote.v1.wallet_hint_dismissed";

export const readWalletHintDismissed = (): boolean => {
  try {
    return loadFromLocalStorage<{ dismissed?: unknown }>(DISMISSED_KEY).dismissed === true;
  } catch {
    return true;
  }
};

export const rememberWalletHintDismissed = () => {
  try {
    saveToLocalStorage(DISMISSED_KEY, { dismissed: true });
  } catch {
    return;
  }
};
