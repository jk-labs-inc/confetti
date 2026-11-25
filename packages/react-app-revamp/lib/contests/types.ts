import { ContestStateEnum } from "@hooks/useContestState/types";
import { TotalRewardsData } from "lib/rewards/types";
import { Abi, Address } from "viem";

export interface ContestReward {
  contestAddress: string;
  chain: string;
  token: {
    symbol: string;
    value: string;
  } | null;
  winners: number;
  numberOfTokens: number;
  rewardsPaidOut: boolean;
}

export interface BaseContestData {
  created_at: string;
  start_at: string;
  end_at: string;
  address: string;
  author_address: string;
  network_name: string;
  vote_start_at: string;
  featured: boolean;
  anyone_can_submit: number;
}

export type ContestRef = Pick<BaseContestData, "address" | "network_name">;

export interface ContestContract {
  address: Address;
  abi: Abi;
  chainId: number;
}

export interface ContestFieldsRead {
  title: string | undefined;
  state: ContestStateEnum | undefined;
  prompt: string | undefined;
}

export interface ContestDetails {
  title: string;
  isCanceled: boolean;
  prompt: string | null;
}

export interface ProcessedContest extends BaseContestData, ContestDetails {}

export interface ContestsResponse {
  data: ProcessedContest[];
  count: number;
}

export interface ContestWithTotalRewards {
  contestAddress: string;
  chain: string;
  hasRewards: boolean;
  rewardsData: TotalRewardsData | null;
}
