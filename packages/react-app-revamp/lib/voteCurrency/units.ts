import { formatUnits } from "viem";
import { isVoteToken } from "./registry";
import { ChargedUnits, VoteCurrency, VotePotSource } from "./types";

export const PRICE_UNIT_DECIMALS = 18;

const chargeScale = (voteCurrency: VoteCurrency): bigint => 10n ** BigInt(PRICE_UNIT_DECIMALS - voteCurrency.decimals);

export const toChargedUnits = (voteCurrency: VoteCurrency, priceUnits: bigint): ChargedUnits =>
  (priceUnits / chargeScale(voteCurrency)) as ChargedUnits;

export const toPriceUnits = (voteCurrency: VoteCurrency, currencyUnits: bigint): bigint =>
  currencyUnits * chargeScale(voteCurrency);

export const isWholeChargedAmount = (voteCurrency: VoteCurrency, priceUnits: bigint): boolean =>
  priceUnits % chargeScale(voteCurrency) === 0n;

export function votePotPriceUnits(voteCurrency: VoteCurrency, pot: VotePotSource | null | undefined): bigint {
  if (!pot) return 0n;
  if (voteCurrency.kind === "native") return pot.native.value;

  const voteTokenKey = Object.keys(pot.tokens).find(tokenAddress => isVoteToken(voteCurrency, tokenAddress));

  return voteTokenKey ? toPriceUnits(voteCurrency, pot.tokens[voteTokenKey].value) : 0n;
}

export const votePotAmount = (voteCurrency: VoteCurrency, pot: VotePotSource | null | undefined): number =>
  Number(formatUnits(votePotPriceUnits(voteCurrency, pot), PRICE_UNIT_DECIMALS));
