import { TokenItem } from "@hooks/useCurrency/useTotalRewardsUsd";
import { RewardsAudience, RewardsPhase } from "lib/rewards/types";

export type RewardsStickerSize = "card" | "stat" | "headline";

interface RewardsStickerBaseProps {
  items: TokenItem[];
  chainName: string;
  phase: RewardsPhase;
}

export type RewardsStickerProps = RewardsStickerBaseProps &
  ({ size: Exclude<RewardsStickerSize, "headline"> } | { size: "headline"; audience: RewardsAudience });
