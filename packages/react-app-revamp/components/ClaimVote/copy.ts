import { CLAIM_PITCH } from "@components/XClaim/copy";
import { pluralize } from "@helpers/pluralize";
import type { PriceDisplay } from "@hooks/useCurrency/useDisplayPrice";
import type { VoteFailure } from "lib/claimVote/types";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import type { XClaimOpenOffer } from "lib/xClaim/types";

const entryName = (entryTitle: string) => entryTitle || "this entry";

export const amountText = ({ displayValue, displaySymbol }: PriceDisplay) =>
  displaySymbol === "$" ? `$${displayValue}` : `${displayValue} ${displaySymbol}`;

const CREDIT_LINE = `verify your twitter and we'll put ${CLAIM_AMOUNT_LABEL} into this vote.`;

const LINKED_CREDIT_LINE = `we'll put ${CLAIM_AMOUNT_LABEL} into this vote.`;

export const creditLine = (offer: XClaimOpenOffer) => {
  if (offer.audience === "signed_out") return CLAIM_PITCH;
  return offer.linked ? LINKED_CREDIT_LINE : CREDIT_LINE;
};

export const WALLET_CREDIT_HINT =
  "sign in with email or social and verify your twitter. it's a new account, not this wallet.";

export const SWITCH_SIGN_IN_LABEL = "switch account";

export const DONT_SHOW_AGAIN_LABEL = "don't show this again";

export const OFFER_RESTORE_LINE = "you hid this from your votes.";

export const OFFER_RESTORE_LABEL = "bring it back";

export const withCreditLabel = (label: string) => `${label} with ${CLAIM_AMOUNT_LABEL} on us`;

export const EXTERNAL_WALLET_LINE = `${CLAIM_AMOUNT_LABEL} on us is for accounts made with email or social sign-in`;

export const GETTING_CREDIT_LABEL = `getting your ${CLAIM_AMOUNT_LABEL}…`;

export const KEEP_PAGE_OPEN_NOTE = "keep this page open, or your claim will fail.";

export const finishLineLabel = (entryTitle: string) => `finish your vote: ${entryName(entryTitle)}`;

export const VOTED_TITLE = `congrats! you\u00a0got\u00a0${CLAIM_AMOUNT_LABEL}`;

export const votedBody = (amount: string | null) =>
  `we've rewarded you as a new user. ${amount ? `you now have ${amount}` : "your votes are"} on your entry. you can get more by voting more.`;

export const VOTED_SHORT_TITLE = `we just put ${CLAIM_AMOUNT_LABEL} on\u00a0your\u00a0entry!`;

export const votedShortBody = ({ wanted, spent }: { wanted: string; spent: string }) =>
  `we know you wanted to put ${wanted}, but since your first ${CLAIM_AMOUNT_LABEL} is on us, we went ahead and put that on your entry. it's on the house. you now have ${spent} there.`;

export const FALLBACK_TITLE = "not quite yet";

export const FALLBACK_RUNNING_BODY = "your twitter didn't pass every check yet, so we're voting with your funds.";

export const fallbackVotedBody = (amount: string | null) =>
  `your twitter didn't pass every check yet, so we couldn't add the ${CLAIM_AMOUNT_LABEL}. ${amount ? `we put your ${amount} on your entry instead.` : "your votes are on your entry."}`;

export const VOTED_SHORT_NOTE = "to put more money, you'll need to fund your wallet first. want to do that now?";

export const ownVoteNote = (entryTitle: string) => `on ${entryName(entryTitle)}`;

export const votesCastText = (votes: number) => pluralize(votes, "vote cast", "votes cast");

export const FINISH_TITLE = `your ${CLAIM_AMOUNT_LABEL} is in your wallet`;

export const FINISH_BUTTON_LABEL = "finish your vote";

export const PAYOUT_SLOW_TITLE = `your ${CLAIM_AMOUNT_LABEL} is on its way`;

export const payoutSlowBody = (entryTitle: string) =>
  `once it lands, finish your vote on ${entryName(entryTitle)} from the vote button.`;

export const CHECK_FAILED_TITLE = "we couldn't check your claim";

export const CHECK_FAILED_BODY = "the network is busy right now. try again in a moment.";

export const VOTE_FAILURE_LINE: Readonly<Record<Exclude<VoteFailure["kind"], "error">, string>> = {
  no_intent: "this vote expired. pick your entry and vote again.",
  voting_closed: "voting has closed for this contest.",
  cannot_afford: "the price moved, so your balance can't cover a vote right now.",
  rejected: "you cancelled the vote.",
  credit_unknown: "we couldn't read your $5 amount. type an amount and finish your vote.",
  in_flight: "your last vote is still going through. give it a moment.",
};

export const voteFailureLine = (failure: VoteFailure) =>
  failure.kind === "error" ? failure.message : VOTE_FAILURE_LINE[failure.kind];
