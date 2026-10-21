export type XClaimSignInHandoff = "deciding" | "sheet_open" | "free";

export type VoteResumeStep = "wait" | "yield_to_claim" | "add_funds" | "vote";

export const voteResumeStep = ({
  needsFunds,
  claim,
  isClaimWaitOver,
}: {
  needsFunds: boolean;
  claim: XClaimSignInHandoff;
  isClaimWaitOver: boolean;
}): VoteResumeStep => {
  if (!needsFunds) return "vote";
  if (claim === "deciding" && !isClaimWaitOver) return "wait";
  if (claim === "sheet_open") return "yield_to_claim";
  return "add_funds";
};
