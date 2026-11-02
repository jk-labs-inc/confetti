import { CLAIM_PITCH } from "@components/XClaim/copy";
import { pluralize } from "@helpers/pluralize";
import type { VoteFailure } from "lib/claimVote/types";
import { CLAIM_AMOUNT_LABEL } from "lib/xClaim/constants";
import type { XClaimOpenOffer } from "lib/xClaim/types";

const entryName = (entryTitle: string) => entryTitle || "this entry";

const CREDIT_LINE = `verify your twitter and we'll put ${CLAIM_AMOUNT_LABEL} into this vote.`;

const LINKED_CREDIT_LINE = `we'll put ${CLAIM_AMOUNT_LABEL} into this vote.`;

export const creditLine = (offer: XClaimOpenOffer) => {
  if (offer.audience === "signed_out") return CLAIM_PITCH;
  return offer.linked ? LINKED_CREDIT_LINE : CREDIT_LINE;
};

export const WALLET_CREDIT_HINT =
  "sign in with email or social and verify your twitter. it's a new account, not this wallet.";

export const SWITCH_SIGN_IN_LABEL = "switch account";

export const WALLET_HINT_DISMISS_LABEL = "don't show this again";

export const withCreditLabel = (label: string) => `${label} with ${CLAIM_AMOUNT_LABEL} on us`;

export const EXTERNAL_WALLET_LINE = `${CLAIM_AMOUNT_LABEL} on us is for accounts made with email or social sign-in`;

export const GETTING_CREDIT_LABEL = `getting your ${CLAIM_AMOUNT_LABEL}…`;

export const KEEP_PAGE_OPEN_NOTE = "keep this page open, or your claim will fail.";

export const finishLineLabel = (entryTitle: string) => `finish your vote: ${entryName(entryTitle)}`;

export const VOTED_TITLE = `you claimed ${CLAIM_AMOUNT_LABEL}`;

export const votedBody = (entryTitle: string) => `and voted for ${entryName(entryTitle)}.`;

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
  taking_long: "your vote is taking longer than usual. if it went through, it will show up on the entry.",
};

export const voteFailureLine = (failure: VoteFailure) =>
  failure.kind === "error" ? failure.message : VOTE_FAILURE_LINE[failure.kind];
