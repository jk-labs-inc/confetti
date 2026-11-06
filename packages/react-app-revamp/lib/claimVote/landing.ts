import { parseRedirect } from "lib/xClaim/outcomes";
import type { XClaimResult } from "lib/xClaim/types";
import { ownsLanding } from "./intent";
import { voteIntentStore } from "./storage";
import type { LandingTaker } from "./types";

export const takeLanding = (taker: LandingTaker, now: number): { result: XClaimResult; at: number } | null => {
  const landing = parseRedirect(window.location.href);
  if (!landing) return null;
  const owner: LandingTaker = ownsLanding(voteIntentStore.read(), window.location.pathname) ? "run" : "sheet";
  if (owner !== taker) return null;
  window.history.replaceState(null, "", landing.cleanUrl);
  return { result: landing.result, at: now };
};
