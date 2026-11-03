import type { ClaimVoteBoard } from "lib/claimVote/types";

export const CLAIM_VOTE_IDS = {
  voteWithCredit: "claim_vote_with_credit",
  walletSwitch: "claim_vote_wallet_switch",
  walletHintDismiss: "claim_vote_wallet_hint_dismiss",
  votedDone: "claim_vote_voted_done",
  votedAddFunds: "claim_vote_voted_add_funds",
  finishVote: "claim_vote_finish",
  ownVoteRetry: "claim_vote_own_vote_retry",
  payoutSlowGotIt: "claim_vote_payout_slow_got_it",
  checkRetry: "claim_vote_check_retry",
  externalGotIt: "claim_vote_external_got_it",
} as const;

export const CLAIM_VOTE_BOARD_IDS: Readonly<Record<ClaimVoteBoard, string>> = {
  VoteRunning: "claim_vote_running",
  VoteDone: "claim_vote_voted",
  VoteFinish: "claim_vote_finish_board",
  PayoutSlow: "claim_vote_payout_slow",
  CheckFailed: "claim_vote_check_failed",
  ExternalWalletInfo: "claim_vote_external_wallet",
};
