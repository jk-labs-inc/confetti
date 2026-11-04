import type { XClaimButtonSpec, XClaimJustVote, XClaimSecondarySpec } from "@components/XClaim/board";
import { X_CLAIM_IDS } from "@components/XClaim/constants";
import { skipTwitterLabel, voteAmountLabel, withVoteTotal } from "@components/XClaim/copy";

export const justVoteButton = (justVote: XClaimJustVote): XClaimButtonSpec => ({
  kind: "run",
  id: X_CLAIM_IDS.justVote,
  label: voteAmountLabel(justVote.ownAmount),
  onPress: justVote.onPress,
});

export const justVoteSecondary = (justVote: XClaimJustVote): XClaimSecondarySpec => ({
  role: "alternative",
  isStrong: true,
  ...justVoteButton(justVote),
  label: skipTwitterLabel(justVote.ownAmount),
});

export const labelWithTotal = (label: string, justVote: XClaimJustVote | null) =>
  justVote?.totalAmount ? withVoteTotal(label, justVote.totalAmount) : label;
