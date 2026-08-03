import { PriceCurveType } from "@hooks/useDeployContest/types";

export enum VoteProjectionMode {
  Hidden = "hidden",
  PushToFirst = "pushToFirst",
  WouldWinNow = "wouldWinNow",
}

export interface EntryStanding {
  entryVotes: number;
  maxOtherVotes: number;
}

export interface PushToFirstParams {
  entryVotes: number;
  maxOtherVotes: number;
  newVotes: number;
  pricePerVoteNative: string;
}

export interface PushToFirstResult {
  votesToFirst: number;
  remainingToFirst: number;
  fillAmount: string;
}

export interface WouldWinNowParams {
  myExistingVotes: number;
  entryVotes: number;
  newVotes: number;
  pricePerVote: number;
  currentPoolNative: number;
  percentageToRewards: number;
  firstPlaceSharePercentage: number;
}

export interface WouldWinNowResult {
  amount: number;
  chargedSpend: number;
  isBelowSpend: boolean;
}

export interface WinUpToParams {
  newVotes: number;
  costToVoteAtStart: bigint;
  multiple: number;
  percentageToRewards: number;
  firstPlaceSharePercentage: number;
  submissionsCount: number;
  priceCurveType?: PriceCurveType;
}
