import { loadFromLocalStorage, saveToLocalStorage } from "@helpers/localStorage";

const TIP_DISMISSED_KEY = "x_claim.v1.tip_dismissed";

export const readTipDismissed = (): boolean => {
  try {
    return loadFromLocalStorage<{ dismissed?: unknown }>(TIP_DISMISSED_KEY).dismissed === true;
  } catch {
    return false;
  }
};

export const rememberTipDismissed = () => {
  try {
    saveToLocalStorage(TIP_DISMISSED_KEY, { dismissed: true });
  } catch {
    return;
  }
};
