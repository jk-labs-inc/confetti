import { safeCompareVersions } from "@helpers/versions";
import { Config, readContract } from "@wagmi/core";
import { VOTE_CURRENCY_VERSION } from "constants/versions";
import { Address, zeroAddress } from "viem";
import { chainVoteCurrency, resolveVoteCurrency, UnsupportedVoteCurrencyError } from "./registry";
import { ContestVoteCurrencyLookup, VoteCurrency } from "./types";

export async function readContestVoteCurrency(
  config: Config,
  contest: ContestVoteCurrencyLookup,
): Promise<VoteCurrency> {
  const chainCurrency = chainVoteCurrency(contest.chainId);
  const versionGate = safeCompareVersions(contest.version, VOTE_CURRENCY_VERSION);

  if (chainCurrency.kind === "native" || versionGate === null) return chainCurrency;
  if (versionGate < 0) throw new UnsupportedVoteCurrencyError(contest.chainId, zeroAddress);

  const voteCurrencyAddress = await readContract(config, {
    address: contest.address,
    abi: contest.abi,
    chainId: contest.chainId,
    functionName: "voteCurrency",
  });

  return resolveVoteCurrency(contest.chainId, voteCurrencyAddress as Address);
}
