import { checksImpliedBy, confirmOutcome, isSettledResult, resultFromMe } from "./outcomes";
import type {
  ClaimMe,
  XClaimBoardView,
  XClaimCheck,
  XClaimFlowResult,
  XClaimInput,
  XClaimOffer,
  XClaimResult,
  XClaimSheetView,
} from "./types";

interface DerivedBoard {
  board: XClaimBoardView;
  fromRedirectOnly: boolean;
}

const confirmed = (board: XClaimBoardView): DerivedBoard => ({ board, fromRedirectOnly: false });

const knownHandle = (me: ClaimMe | null) => me?.link?.handle ?? null;

const canClaimNow = ({ me, spots }: XClaimInput) =>
  me ? me.canClaim : spots !== null && spots.open > 0 && !spots.paused;

const claimedBoard = ({ me }: XClaimInput): XClaimBoardView => {
  const claim = me?.claim;
  const activeClaim = claim && (claim.status === "paid" || claim.status === "pending") ? claim : null;
  if (!activeClaim) return { board: "AlreadyClaimed", handle: null, usdAmount: null, claimedAt: null };
  const link = me?.link;
  const linkPredatesClaim = !!link && link.linkedAt.getTime() <= activeClaim.createdAt.getTime();
  return {
    board: "AlreadyClaimed",
    handle: linkPredatesClaim ? link.handle : null,
    usdAmount: activeClaim.payout.usdAmount,
    claimedAt: activeClaim.createdAt,
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
      return {
        board: "Success",
        payout: { ...result.payout, usdAmount: result.payout.usdAmount ?? input.spots?.usdAmount ?? null },
        confirming: result.kind === "pending",
      };
    case "payout_failed":
      return { board: "PayoutFailed", handle: knownHandle(input.me), usdAmount: input.spots?.usdAmount ?? null };
    case "not_eligible":
      return notEligibleBoard(input, result.failedCheck);
    case "x_linked_elsewhere":
      return { board: "AlreadyLinked" };
    case "wallet_claimed":
      return claimedBoard(input);
    case "no_spots":
      return {
        board: "NoSpots",
        handle: knownHandle(input.me),
        cause: {
          kind: "no_spots",
          nextReleaseAt: result.nextReleaseAt ?? input.me?.spots.nextReleaseAt ?? input.spots?.nextReleaseAt ?? null,
        },
        canClaimNow: canClaimNow(input),
      };
    case "paused":
      return { board: "NoSpots", handle: knownHandle(input.me), cause: { kind: "paused" }, canClaimNow: canClaimNow(input) };
    case "x_cancelled":
      return { board: "XCancelled", reason: result.reason };
    default: {
      const exhaustive: never = result;
      return exhaustive;
    }
  }
};

const offerBoard = (input: XClaimInput): XClaimBoardView => {
  const { wallet, me, memory, action } = input;
  if (me) {
    if (isSettledResult(resultFromMe(me))) return claimedBoard(input);
    if (me.link?.eligible) {
      if (me.canClaim) return { board: "ClaimLinked", handle: me.link.handle };
      return {
        board: "NoSpots",
        handle: me.link.handle,
        cause: me.spots.paused ? { kind: "paused" } : { kind: "no_spots", nextReleaseAt: me.spots.nextReleaseAt },
        canClaimNow: false,
      };
    }
  }
  if (wallet.kind === "external") {
    if (!me && memory === "settled") return claimedBoard(input);
    if (!me && memory === "retryable") return { board: "ClaimLinked", handle: null };
    const signed = action.name === "start_x" && (action.stage === "submitting" || action.stage === "redirecting");
    return { board: "ClaimExternalWallet", activeStep: signed ? 2 : 1 };
  }
  if (wallet.kind === "embedded" && wallet.signedInWithX) return { board: "ClaimConfirmX" };
  return { board: "ClaimStart" };
};

const flowBoard = (flow: XClaimFlowResult, input: XClaimInput): DerivedBoard => {
  const { result, source, at } = flow;
  if (result.kind === "x_cancelled") return { board: resultBoard(result, input), fromRedirectOnly: source === "redirect" };

  if (input.me && input.meUpdatedAt > at) {
    const truth = confirmOutcome(result, input.me);
    return confirmed(truth ? resultBoard(truth, input) : offerBoard(input));
  }
  if (source === "worker") return confirmed(resultBoard(result, input));

  const awaitingConfirmation =
    !flow.walletWaitOver &&
    ((input.wallet.kind === "embedded" && input.meFailedAt <= at) || input.wallet.kind === "signed_out");
  if (awaitingConfirmation) return confirmed({ board: "Checking", handle: null });

  return { board: resultBoard(result, input), fromRedirectOnly: true };
};

const deriveBoard = (input: XClaimInput): DerivedBoard => {
  const { action, result } = input;
  const isClaimingOrChecking = action.name === "retry_claim" || action.name === "check_status";
  if (isClaimingOrChecking && action.stage === "submitting") {
    return confirmed({ board: "Checking", handle: knownHandle(input.me) });
  }
  return result ? flowBoard(result, input) : confirmed(offerBoard(input));
};

export const deriveView = (input: XClaimInput): XClaimSheetView => {
  const { board, fromRedirectOnly } = deriveBoard(input);
  return {
    ...board,
    wallet: input.wallet,
    spots: input.spots,
    action: { stage: input.action.stage, error: input.action.error },
    fromRedirectOnly,
  };
};

export const deriveOffer = (input: XClaimInput): XClaimOffer => {
  const { configured, wallet, spots, me, memory } = input;
  if (!configured) return { status: "off", reason: "not_configured" };
  if (!spots) return { status: "off", reason: input.spotsFailed ? "unavailable" : "loading" };
  if (wallet.kind === "embedded" && input.meLoading) return { status: "off", reason: "loading" };
  if (me && isSettledResult(resultFromMe(me))) return { status: "off", reason: "settled" };
  if (!me && wallet.kind === "external" && memory === "settled") return { status: "off", reason: "settled" };

  const audience = wallet.kind === "signed_out" ? "signed_out" : "signed_in";
  if (spots.paused || spots.open === 0) {
    return { status: "waiting", audience, nextReleaseAt: spots.nextReleaseAt, paused: spots.paused };
  }
  return { status: "open", audience, spots };
};
