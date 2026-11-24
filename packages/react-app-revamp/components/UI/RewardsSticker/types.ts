import { TokenItem } from "@hooks/useCurrency/useTotalRewardsUsd";
import { RewardsAudience, RewardsPhase } from "lib/rewards/types";

export type RewardsStickerSize = "card" | "stat" | "headline" | "hero";

export type RewardsStickerLabeledSize = Extract<RewardsStickerSize, "headline" | "hero">;

interface RewardsStickerBaseProps {
  items: TokenItem[];
  chainName: string;
  phase: RewardsPhase;
}

export type RewardsStickerProps = RewardsStickerBaseProps &
  (
    | { size: Exclude<RewardsStickerSize, RewardsStickerLabeledSize> }
    | { size: RewardsStickerLabeledSize; audience: RewardsAudience }
  );
