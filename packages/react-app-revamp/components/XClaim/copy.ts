import { formatMonthDay, formatTimeOfDay, isToday } from "@helpers/dates";
import { pluralize } from "@helpers/pluralize";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import type {
  XAccountStats,
  XCancelledReason,
  XClaimActionStage,
  XClaimCheck,
  XClaimFailureReason,
  XClaimTeaserOffer,
} from "lib/xClaim/types";

export const CLAIM_PLUS_LABEL = `+${CLAIM_AMOUNT_LABEL}`;

export const CLAIM_TITLE = `claim ${CLAIM_AMOUNT_LABEL}... for free!`;

export const CLAIM_BUTTON_LABEL = `claim ${CLAIM_AMOUNT_LABEL}`;

export const VERIFY_TWITTER_LABEL = "verify twitter";

export const CLAIM_PITCH = `create an account, verify your twitter, and we'll give you ${CLAIM_AMOUNT_LABEL} to play with.`;

export const CLAIM_FINE_PRINT = "one claim per twitter account and wallet. we only read your public profile.";

export const releaseTimeText = (nextReleaseAt: Date) =>
  `${isToday(nextReleaseAt) ? "" : "tomorrow "}at ${formatTimeOfDay(nextReleaseAt)}`;

export const noSpotsText = (nextReleaseAt: Date) =>
  isToday(nextReleaseAt)
    ? `all spots have been claimed for now. please try again at ${formatTimeOfDay(nextReleaseAt)}!`
    : "all spots have been claimed for today. please try again tomorrow!";

export const teaserText = (offer: XClaimTeaserOffer) =>
  offer.status === "open" ? CLAIM_PITCH : noSpotsText(offer.nextReleaseAt);

export const CANCELLED_BODY: Readonly<Record<XCancelledReason, string>> = {
  x_denied: "you cancelled on twitter, or it took too long. nothing was linked, so you can try again.",
  x_browser_mismatch:
    "twitter finished in a different browser or app than the one you started in. nothing was linked, so try again and finish here.",
  x_state_invalid: "that twitter connection expired or was already used. nothing was linked, so start a fresh one.",
  x_error: "twitter had a hiccup reading your profile. nothing was linked, so you can try again.",
  server_error: "something broke on our side while connecting twitter. give it a moment, then try again.",
  unrecognized: "something unexpected came back from twitter. you can try again.",
};

export const FAILURE_LINE: Readonly<Record<XClaimFailureReason, string>> = {
  signature_rejected: "you cancelled the signature. nothing was sent, so tap again when you're ready.",
  wallet_proof: "we couldn't verify this wallet. try again, or sign out and back in.",
  signed_out: "you're signed out. sign in again, then come back to claim.",
  not_linked: "we couldn't find your twitter account. verify twitter again to continue.",
  temporary: "the network is busy right now. try again in a moment.",
  misconfigured: "claiming isn't available right now. please try again later.",
};

export const SETTLING_LABEL = "one sec…";

export const BUSY_LABEL: Readonly<Record<Exclude<XClaimActionStage, "idle">, string>> = {
  awaiting_signature: "check your wallet…",
  submitting: "opening twitter…",
  redirecting: "opening twitter…",
};

const CHECK_LABEL: Readonly<Record<XClaimCheck, string>> = {
  verified: "verified profile",
  verifiedFollowers: "1+ verified follower",
  ratio: "balanced follows",
};

export const checkLabel = ({
  check,
  failed,
  stats,
}: {
  check: XClaimCheck;
  failed: boolean;
  stats: XAccountStats | null;
}) => {
  const verifiedFollowers = stats?.verifiedFollowers;
  if (check === "verifiedFollowers" && failed && typeof verifiedFollowers === "number") {
    return pluralize(verifiedFollowers, "verified follower", "verified followers");
  }
  return CHECK_LABEL[check];
};

export const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export const handleText = (handle: string | null, fallback = "your twitter") => (handle ? `@${handle}` : fallback);

export const claimedPillText = ({ handle, claimedAt }: { handle: string | null; claimedAt: Date | null }) => {
  const parts = ["claimed", claimedAt ? formatMonthDay(claimedAt) : null, handle ? `with @${handle}` : null];
  return claimedAt || handle ? parts.filter(Boolean).join(" ") : "claimed on this wallet";
};

export const savedForText = (handle: string | null) => `saved for ${handleText(handle, "you")}`;
