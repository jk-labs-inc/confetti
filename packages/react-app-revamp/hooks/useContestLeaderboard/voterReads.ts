import { ContractQuery } from "lib/rewards/types";
import { createERC20TokenQuery, createNativeTokenQuery } from "lib/rewards/utils";
import { VoteCurrency } from "lib/voteCurrency";
import { Abi } from "viem";

interface RewardsModuleReadTarget {
  address: `0x${string}`;
  abi: Abi;
  chainId: number;
}

interface VoterEarningQueriesParams {
  voteCurrency: VoteCurrency;
  rewardsModule: RewardsModuleReadTarget;
  rankings: number[];
  voter: `0x${string}`;
  includeReleased: boolean;
}

const releasableToVoterQuery = (
  voteCurrency: VoteCurrency,
  rewardsModule: RewardsModuleReadTarget,
  ranking: number,
  voter: `0x${string}`,
): ContractQuery =>
  voteCurrency.kind === "token"
    ? createERC20TokenQuery(
        rewardsModule.address,
        rewardsModule.chainId,
        rewardsModule.abi,
        ranking,
        voteCurrency.address,
        voter,
      )
    : createNativeTokenQuery(rewardsModule.address, rewardsModule.chainId, rewardsModule.abi, ranking, voter);

const releasedToVoterQuery = (
  voteCurrency: VoteCurrency,
  rewardsModule: RewardsModuleReadTarget,
  ranking: number,
  voter: `0x${string}`,
): ContractQuery =>
  voteCurrency.kind === "token"
    ? {
        ...rewardsModule,
        functionName: "erc20ReleasedToVoter",
        args: [voteCurrency.address, voter, BigInt(ranking)],
      }
    : { ...rewardsModule, functionName: "releasedToVoter", args: [voter, BigInt(ranking)] };

export function voterEarningQueries({
  voteCurrency,
  rewardsModule,
  rankings,
  voter,
  includeReleased,
}: VoterEarningQueriesParams): ContractQuery[] {
  const releasable = rankings.map(ranking => releasableToVoterQuery(voteCurrency, rewardsModule, ranking, voter));
  if (!includeReleased) return releasable;

  return [...releasable, ...rankings.map(ranking => releasedToVoterQuery(voteCurrency, rewardsModule, ranking, voter))];
}
