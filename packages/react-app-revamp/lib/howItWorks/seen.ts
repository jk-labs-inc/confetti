import { loadFromLocalStorage, saveToLocalStorage } from "@helpers/localStorage";

const SEEN_KEY = "how_it_works.v1.seen";

export const readHowItWorksSeen = (): boolean => {
  try {
    return loadFromLocalStorage<{ seen?: unknown }>(SEEN_KEY).seen === true;
  } catch {
    return true;
  }
};

export const rememberHowItWorksSeen = () => {
  try {
    saveToLocalStorage(SEEN_KEY, { seen: true });
  } catch {
    return;
  }
};
