import { checksImpliedBy, confirmOutcome, isSettledResult, resultFromMe } from "./outcomes";
import type {
  ClaimMe,
  XClaimBoardView,
  XClaimCheck,
  XClaimFlowResult,
  XClaimInput,
  XClaimNoSpotsCause,
  XClaimOffer,
  XClaimOfferAudience,
  XClaimOpenOffer,
  XClaimResult,
  XClaimSheetView,
  XClaimSpots,
  XClaimTeaserOffer,
} from "./types";

export const paysOnChain = (spots: Pick<XClaimSpots, "network">, chain: string | null) =>
  !chain || chain.toLowerCase() === spots.network;

const knownHandle = (me: ClaimMe | null) => me?.link?.handle ?? null;

const latestSpots = ({ spots, me }: XClaimInput) => spots ?? me?.spots ?? null;

const spotsOpenNow = (input: XClaimInput) => {
  const spots = latestSpots(input);
  return spots !== null && spots.open > 0 && !spots.paused;
};

const isSettled = ({ me, wallet, memory }: XClaimInput) =>
  me ? isSettledResult(resultFromMe(me)) : wallet.kind === "external" && memory === "settled";

const isLinked = ({ me, wallet, memory }: XClaimInput) =>
  me ? !!me.link?.eligible : wallet.kind === "external" && memory === "retryable";

const canClaimNow = (input: XClaimInput) => {
  if (input.me && (isSettled(input) || !isLinked(input))) return false;
  return spotsOpenNow(input);
};

const spotsCause = (spots: Pick<XClaimSpots, "paused" | "nextReleaseAt">): XClaimNoSpotsCause =>
  spots.paused ? { kind: "paused" } : { kind: "no_spots", nextReleaseAt: spots.nextReleaseAt };

const noSpotsBoard = (input: XClaimInput, cause: XClaimNoSpotsCause): XClaimBoardView => ({
  board: "NoSpots",
  handle: knownHandle(input.me),
  cause,
  canClaimNow: canClaimNow(input),
});

const claimedBoard = ({ me, contestChain }: XClaimInput): XClaimBoardView => {
  const claim = me?.claim;
  const activeClaim = claim && (claim.status === "paid" || claim.status === "pending") ? claim : null;
  const onContest = contestChain !== null;
  if (!activeClaim) return { board: "AlreadyClaimed", handle: null, usdAmount: null, claimedAt: null, onContest };
  const link = me?.link;
  const linkPredatesClaim = !!link && link.linkedAt.getTime() <= activeClaim.createdAt.getTime();
  return {
    board: "AlreadyClaimed",
    handle: linkPredatesClaim ? link.handle : null,
    usdAmount: activeClaim.payout.usdAmount,
    claimedAt: activeClaim.createdAt,
    onContest,
  };
};

const notEligibleBoard = (input: XClaimInput, failedCheck: XClaimCheck): XClaimBoardView => {
  const link = input.me?.link;
  const failingLink = link && !link.eligible ? link : null;
  return {
    board: "NotEligible",
    handle: link?.handle ?? null,
    checks: failingLink ? failingLink.checks : checksImpliedBy(failedCheck),
    stats: failingLink ? failingLink.stats : null,
  };
};

const resultBoard = (result: XClaimResult, input: XClaimInput): XClaimBoardView => {
  switch (result.kind) {
    case "paid":
    case "pending":
      return { board: "Success", confirming: result.kind === "pending", onContest: input.contestChain !== null };
    case "payout_failed":
      return { board: "PayoutFailed", handle: knownHandle(input.me), usdAmount: input.spots?.usdAmount ?? null };
    case "not_eligible":
      return notEligibleBoard(input, result.failedCheck);
    case "x_linked_elsewhere":
      return { board: "AlreadyLinked" };
    case "wallet_claimed":
      return claimedBoard(input);
    case "no_spots":
      return noSpotsBoard(input, {
        kind: "no_spots",
        nextReleaseAt: result.nextReleaseAt ?? latestSpots(input)?.nextReleaseAt ?? null,
      });
    case "paused":
      return noSpotsBoard(input, { kind: "paused" });
    case "x_cancelled":
      return { board: "XCancelled", reason: result.reason };
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
};

const offerBoard = (input: XClaimInput): XClaimBoardView => {
  const { wallet, me, action } = input;
  if (isSettled(input)) return claimedBoard(input);
  if (isLinked(input)) {
    if (!me || spotsOpenNow(input)) return { board: "ClaimLinked", handle: knownHandle(me) };
    return noSpotsBoard(input, spotsCause(input.spots ?? me.spots));
  }
  if (wallet.kind === "external") {
    const signed = action.name === "start_x" && (action.stage === "submitting" || action.stage === "redirecting");
    return { board: "ClaimExternalWallet", activeStep: signed ? 2 : 1, wallet };
  }
  if (wallet.kind === "signed_out") return { board: "ClaimSignedOut" };
  if (wallet.signedInWithX) return { board: "ClaimConfirmX" };
  return { board: "ClaimStart" };
};

const flowBoard = (flow: XClaimFlowResult, input: XClaimInput): XClaimBoardView => {
  const { result, source, at } = flow;
  if (result.kind === "x_cancelled") return resultBoard(result, input);

  if (input.me && input.meUpdatedAt > at) {
    const truth = confirmOutcome(result, input.me);
    return truth ? resultBoard(truth, input) : offerBoard(input);
  }

  const awaitingConfirmation =
    source === "redirect" &&
    !flow.walletWaitOver &&
    ((input.wallet.kind === "embedded" && input.meFailedAt <= at) || input.wallet.kind === "signed_out");
  return awaitingConfirmation ? { board: "Checking", handle: null } : resultBoard(result, input);
};

const deriveBoard = (input: XClaimInput): XClaimBoardView => {
  const { action, result } = input;
  const isClaimingOrChecking = action.name === "retry_claim" || action.name === "check_status";
  if (isClaimingOrChecking && action.stage === "submitting") {
    return { board: "Checking", handle: knownHandle(input.me) };
  }
  return result ? flowBoard(result, input) : offerBoard(input);
};

export const deriveView = (input: XClaimInput): XClaimSheetView => ({
  wallet: input.wallet,
  spots: input.spots,
  action: { stage: input.action.stage, error: input.action.error },
  settling: input.wallet.kind === "embedded" && input.meLoading,
  ...deriveBoard(input),
});

export const deriveOffer = (input: XClaimInput): XClaimOffer => {
  const { configured, wallet, spots } = input;
  if (!configured) return { status: "off", reason: "not_configured" };
  if (!spots) return { status: "off", reason: input.spotsFailed ? "unavailable" : "loading" };
  if (!paysOnChain(spots, input.contestChain)) return { status: "off", reason: "other_chain" };
  if (wallet.kind === "embedded" && input.meLoading) return { status: "off", reason: "loading" };
  if (isSettled(input)) return { status: "off", reason: "settled" };

  const audience = wallet.kind === "signed_out" ? "signed_out" : "signed_in";
  if (spots.paused || spots.open === 0) {
    return { status: "waiting", audience, nextReleaseAt: spots.nextReleaseAt, paused: spots.paused };
  }
  return { status: "open", audience, spots, linked: isLinked(input) };
};

export const openOfferFor = (offer: XClaimOffer, audience: XClaimOfferAudience): XClaimOpenOffer | null =>
  offer.status === "open" && offer.audience === audience ? offer : null;

export const signedOutTeaserFor = (offer: XClaimOffer): XClaimTeaserOffer | null => {
  if (offer.status === "off" || offer.audience !== "signed_out") return null;
  return offer.status === "waiting" && offer.paused ? null : offer;
};
