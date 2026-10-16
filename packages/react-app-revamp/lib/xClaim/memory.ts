import { loadFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from "@helpers/localStorage";
import { FLOW_STARTER_KEY, FLOW_STARTER_TTL_MS, MEMORY_KEY_PREFIX, TIP_DISMISSED_KEY } from "./constants";
import { isSettledResult, resultFromMe } from "./outcomes";
import type { ClaimMe, XClaimMemory, XClaimResult } from "./types";

const keyFor = (address: string) => `${MEMORY_KEY_PREFIX}${address.toLowerCase()}`;

const isMemory = (value: unknown): value is XClaimMemory => value === "settled" || value === "retryable";

export const readMemory = (address: string): XClaimMemory | null => {
  try {
    const { state } = loadFromLocalStorage<{ state?: unknown }>(keyFor(address));
    return isMemory(state) ? state : null;
  } catch {
    return null;
  }
};

export const writeMemory = (address: string, state: XClaimMemory | null) => {
  try {
    if (state) saveToLocalStorage(keyFor(address), { state });
    else removeFromLocalStorage(keyFor(address));
  } catch {
    return;
  }
};

export const memoryFromWorkerResult = (result: XClaimResult): XClaimMemory | null => {
  switch (result.kind) {
    case "paid":
    case "pending":
    case "wallet_claimed":
      return "settled";
    case "no_spots":
    case "payout_failed":
    case "paused":
      return "retryable";
    case "not_eligible":
    case "x_linked_elsewhere":
    case "x_cancelled":
      return null;
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
};

export const memoryFromMe = (me: ClaimMe): XClaimMemory | null => {
  if (isSettledResult(resultFromMe(me))) return "settled";
  return me.link?.eligible ? "retryable" : null;
};

export const memoryAfterHint = (current: XClaimMemory | null, hint: XClaimResult): XClaimMemory | null => {
  if (current === "settled") return current;
  const fromHint = memoryFromWorkerResult(hint);
  return fromHint ?? current;
};

export const rememberFlowStarter = (address: string) => {
  try {
    sessionStorage.setItem(FLOW_STARTER_KEY, JSON.stringify({ address: address.toLowerCase(), at: Date.now() }));
  } catch {
    return;
  }
};

export const takeFlowStarter = (now: number): string | null => {
  try {
    const raw = sessionStorage.getItem(FLOW_STARTER_KEY);
    sessionStorage.removeItem(FLOW_STARTER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || !("address" in parsed) || !("at" in parsed)) return null;
    const { address, at } = parsed;
    if (typeof address !== "string" || typeof at !== "number" || now - at > FLOW_STARTER_TTL_MS) return null;
    return address;
  } catch {
    return null;
  }
};

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
