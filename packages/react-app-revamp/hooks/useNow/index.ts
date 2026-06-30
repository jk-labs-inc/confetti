import { useSyncExternalStore } from "react";

const TICK_MS = 30_000;

let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

const emit = (): void => {
  now = Date.now();
  listeners.forEach(listener => listener());
};

const onVisibility = (): void => {
  if (document.visibilityState === "visible") emit();
};

const start = (): void => {
  if (timer !== null) return;
  now = Date.now();
  timer = setInterval(emit, TICK_MS);
  if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisibility);
};

const stop = (): void => {
  if (timer === null) return;
  clearInterval(timer);
  timer = null;
  if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibility);
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
};

const getSnapshot = (): number => now;

export const useNow = (): number => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export default useNow;
