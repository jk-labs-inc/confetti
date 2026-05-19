export interface ContestStatus {
  status: string;
  timeLeft: string;
}

export type ContestStateType = "live" | "accepting-entries" | null;

export type ContestTitleStateType = "active" | "finished" | "canceled";

export type ContestTimingFormat = "countdown" | "weekday" | "date" | "ended" | "canceled";

export interface ContestTimingData {
  format: ContestTimingFormat;
  display: string;
  timeZoneAbbr?: string;
}

export interface RewardDisplayData {
  amount: bigint;
  decimals: number;
  symbol: string;
  formatted: string;
  isNative: boolean;
}

export interface TimeWindowResult {
  display: string;
  spansMultipleDays: boolean;
}
