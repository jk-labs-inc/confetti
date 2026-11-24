import { TokenItem } from "@hooks/useCurrency/useTotalRewardsUsd";
import { RewardsAudience, RewardsPhase } from "lib/rewards/types";

export type ContestPoolDisplay =
  | { status: "loading" }
  | { status: "empty" }
  | {
      status: "ready";
      tokenItems: TokenItem[];
      chainName: string;
      phase: RewardsPhase;
      audience: RewardsAudience;
    };
