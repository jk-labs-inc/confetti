import { INTENT_KEY } from "./constants";
import { parseIntent } from "./intent";
import type { VoteIntent } from "./types";

type IntentPatch = Partial<
  Pick<VoteIntent, "amountNative" | "ownFundsCanVote" | "savedAt" | "votesBefore" | "sentTxHash" | "sendingAt" | "castingAt">
>;

const listeners = new Set<() => void>();

let snapshot: { raw: string | null; intent: VoteIntent | null } = { raw: null, intent: null };

const readRaw = (): string | null => {
  try {
    return window.localStorage.getItem(INTENT_KEY);
  } catch {
    return null;
  }
};

const parseRaw = (raw: string | null): VoteIntent | null => {
  if (raw === null) return null;
  try {
    return parseIntent(JSON.parse(raw));
  } catch {
    return null;
  }
};

const notify = () => listeners.forEach(listener => listener());

const writeRaw = (intent: VoteIntent | null) => {
  try {
    if (intent) window.localStorage.setItem(INTENT_KEY, JSON.stringify(intent));
    else window.localStorage.removeItem(INTENT_KEY);
  } catch {
    return;
  }
  notify();
};

const onStorage = (event: StorageEvent) => {
  if (event.key === INTENT_KEY || event.key === null) notify();
};

export const voteIntentStore = {
  read: (): VoteIntent | null => {
    const raw = readRaw();
    if (raw !== snapshot.raw) snapshot = { raw, intent: parseRaw(raw) };
    return snapshot.intent;
  },

  save: (intent: VoteIntent) => writeRaw(intent),

  update: (patch: IntentPatch) => {
    const current = voteIntentStore.read();
    if (current) writeRaw({ ...current, ...patch });
  },

  clear: () => writeRaw(null),

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
};
