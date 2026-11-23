import { RewardsAudience, RewardsPhase, RewardTokenItem } from "lib/rewards/types";

export type ContestPoolDisplay =
  | { status: "loading" }
  | { status: "empty" }
  | {
      status: "ready";
      tokenItems: RewardTokenItem[];
      chainName: string;
      phase: RewardsPhase;
      audience: RewardsAudience;
    };
