import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { QueryClient } from "@tanstack/react-query";
import { readContracts } from "@wagmi/core";
import { compareVersions } from "compare-versions";
import { ANALYTICS_VERSION, DOWNVOTES_REMOVED_VERSION } from "constants/versions";
import { validateRankings } from "lib/rewards/contracts";
import { ContractQuery, VOTER_REWARDS_VERSION } from "lib/rewards/types";
import { createNativeTokenQuery } from "lib/rewards/utils";
import { Abi, BaseError, ContractFunctionRevertedError, formatEther, toFunctionSelector } from "viem";
import { VerifiedVoterStats, VerifiedVoterStatsMap } from "./types";

interface ContestTarget {
  address: `0x${string}`;
  abi: Abi;
  chainId: number;
  version: string;
}

interface RewardsModuleTarget {
  address: `0x${string}`;
  abi: Abi;
  payees: number[];
}

interface FetchVerifiedVoterStatsParams {
  addresses: string[];
  mainEntryByAddress: Map<string, string>;
  contest: ContestTarget;
  rewardsModule: RewardsModuleTarget;
  creatorAddress: string;
  includeReleased: boolean;
}

interface ResolvePayeeRankingsParams {
  payees: number[];
  moduleAddress: `0x${string}`;
  moduleAbi: Abi;
  chainId: number;
  version: string;
  creatorAddress?: `0x${string}`;
}

interface InvalidateContestLeaderboardParams {
  contestAddress: string;
  chainId: number;
}

interface AddressCallPlan {
  address: string;
  mainEntryId: string | null;
  offset: number;
  count: number;
}

type ReadResult = { status: "success" | "failure"; result?: unknown };

export const LEADERBOARD_VERIFY_STALE_TIME = 30_000;
export const LEADERBOARD_VERIFY_GC_TIME = 5 * 60_000;
export const VERIFY_MIN_INTERVAL_MS = 15_000;

const UNPOPULATED_RANK_ERROR_NAME = "RankIsNotInSortedRanks";
const UNPOPULATED_RANK_ERROR_SELECTOR = toFunctionSelector(`${UNPOPULATED_RANK_ERROR_NAME}()`);

export const contestLeaderboardVerifyQueryKey = (contestAddress: string, chainId: number) =>
  ["contestLeaderboardVerify", contestAddress.toLowerCase(), chainId] as const;

export const invalidateContestLeaderboard = (
  queryClient: QueryClient,
  { contestAddress, chainId }: InvalidateContestLeaderboardParams,
): Promise<void> => {
  if (!contestAddress) return Promise.resolve();
  const queryKey = contestLeaderboardVerifyQueryKey(contestAddress, chainId);
  queryClient.removeQueries({ queryKey, type: "inactive" });
  return queryClient.invalidateQueries({ queryKey });
};

const isUnpopulatedRankRevert = (error: unknown): boolean => {
  if (!(error instanceof BaseError)) return false;
  const reverted = error.walk(cause => cause instanceof ContractFunctionRevertedError);
  if (!(reverted instanceof ContractFunctionRevertedError)) return false;
  return (
    reverted.data?.errorName === UNPOPULATED_RANK_ERROR_NAME || reverted.signature === UNPOPULATED_RANK_ERROR_SELECTOR
  );
};

async function resolvePayeeRankings({
  payees,
  moduleAddress,
  moduleAbi,
  chainId,
  version,
  creatorAddress,
}: ResolvePayeeRankingsParams): Promise<number[]> {
  if (payees.length === 0) return [];
  if (compareVersions(version, VOTER_REWARDS_VERSION) < 0) {
    const { validRankings } = await validateRankings(
      payees,
      moduleAddress,
      chainId,
      moduleAbi,
      version,
      creatorAddress,
    );
    return validRankings;
  }

  const reads = await readContracts(getWagmiConfig(), {
    contracts: payees.map(ranking => ({
      address: moduleAddress,
      chainId,
      abi: moduleAbi,
      functionName: "getProposalIdOfRanking",
      args: [BigInt(ranking)],
    })),
  });

  const validRankings: number[] = [];
  reads.forEach((read, index) => {
    const ranking = payees[index];
    if (read.status === "failure") {
      if (isUnpopulatedRankRevert(read.error)) return;
      throw read.error;
    }
    if (read.result !== 0n) validRankings.push(ranking);
  });

  return validRankings;
}

const asBigint = (read: ReadResult | undefined): bigint =>
  read?.status === "success" && typeof read.result === "bigint" ? read.result : 0n;

const toNetVotes = (raw: unknown, hasDownvotes: boolean): number => {
  if (hasDownvotes) {
    const [forVotes, againstVotes] = raw as [bigint, bigint];
    return Number(formatEther(forVotes - againstVotes));
  }
  return Number(formatEther(raw as bigint));
};

export async function fetchVerifiedVoterStats({
  addresses,
  mainEntryByAddress,
  contest,
  rewardsModule,
  creatorAddress,
  includeReleased,
}: FetchVerifiedVoterStatsParams): Promise<VerifiedVoterStatsMap> {
  const validRankings = await resolvePayeeRankings({
    payees: rewardsModule.payees,
    moduleAddress: rewardsModule.address,
    moduleAbi: rewardsModule.abi,
    chainId: contest.chainId,
    version: contest.version,
    creatorAddress: creatorAddress ? (creatorAddress as `0x${string}`) : undefined,
  });

  const includeSpent = compareVersions(contest.version, ANALYTICS_VERSION) >= 0;
  const hasDownvotes = compareVersions(contest.version, DOWNVOTES_REMOVED_VERSION) < 0;
  const contestTarget = { address: contest.address, abi: contest.abi, chainId: contest.chainId };
  const moduleTarget = { address: rewardsModule.address, abi: rewardsModule.abi, chainId: contest.chainId };

  const contracts: ContractQuery[] = [];
  const plans: AddressCallPlan[] = [];

  for (const address of addresses) {
    const offset = contracts.length;
    const voter = address as `0x${string}`;
    for (const ranking of validRankings) {
      contracts.push(createNativeTokenQuery(rewardsModule.address, contest.chainId, rewardsModule.abi, ranking, voter));
    }
    if (includeReleased) {
      for (const ranking of validRankings) {
        contracts.push({ ...moduleTarget, functionName: "releasedToVoter", args: [voter, BigInt(ranking)] });
      }
    }
    if (includeSpent) {
      contracts.push({ ...contestTarget, functionName: "getTotalSpentByAddress", args: [voter] });
    }
    const mainEntryId = mainEntryByAddress.get(address) ?? null;
    if (mainEntryId) {
      contracts.push({ ...contestTarget, functionName: "proposalAddressVotes", args: [mainEntryId, voter] });
    }
    plans.push({ address, mainEntryId, offset, count: contracts.length - offset });
  }

  const results: ReadResult[] = contracts.length > 0 ? await readContracts(getWagmiConfig(), { contracts }) : [];
  const stats: VerifiedVoterStatsMap = new Map();

  for (const plan of plans) {
    const reads = results.slice(plan.offset, plan.offset + plan.count);
    const isVerified = reads.length === plan.count && reads.every(read => read.status === "success");
    let cursor = 0;
    let earningWei = 0n;

    const earningReadCount = validRankings.length * (includeReleased ? 2 : 1);
    while (cursor < earningReadCount) earningWei += asBigint(reads[cursor++]);
    const spentWei = includeSpent ? asBigint(reads[cursor++]) : null;
    const votesRead = plan.mainEntryId ? reads[cursor++] : undefined;
    const votesOnMainEntry =
      votesRead?.status === "success" && votesRead.result !== undefined
        ? toNetVotes(votesRead.result, hasDownvotes)
        : null;

    const entry: VerifiedVoterStats = {
      address: plan.address,
      earningWei,
      spentWei,
      mainEntryId: plan.mainEntryId,
      votesOnMainEntry,
      isVerified,
    };
    stats.set(plan.address, entry);
  }

  return stats;
}
