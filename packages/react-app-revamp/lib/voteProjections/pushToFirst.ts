import { toFixedString } from "@helpers/formatBalance";
import { formatEther, parseEther } from "viem";
import { PushToFirstParams, PushToFirstResult } from "./types";

/**
 * money needed for the entry to be strictly 1st by one vote — the extra vote is what
 * makes "would win now" show a value the instant the preset fills the input.
 * null when the entry already holds 1st outright (nothing to push).
 */
export const calculatePushToFirst = ({
  entryVotes,
  maxOtherVotes,
  newVotes,
  pricePerVoteNative,
}: PushToFirstParams): PushToFirstResult | null => {
  const votesToFirst = Math.max(0, maxOtherVotes - entryVotes + 1);
  if (votesToFirst === 0) return null;

  const price = parseFloat(pricePerVoteNative);
  if (isNaN(price) || price <= 0) return null;

  const remainingVotes = Math.max(0, votesToFirst - newVotes);
  const remainingToFirst = remainingVotes * price;

  let fillAmount: string;
  try {
    fillAmount = formatEther(parseEther(pricePerVoteNative) * BigInt(votesToFirst));
  } catch {
    fillAmount = toFixedString(votesToFirst * price);
  }

  return { votesToFirst, remainingToFirst, fillAmount };
};
