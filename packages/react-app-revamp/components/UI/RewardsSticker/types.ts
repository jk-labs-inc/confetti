import { RewardsAudience, RewardsPhase, RewardTokenItem } from "lib/rewards/types";

export type RewardsStickerSize = "card" | "stat" | "headline" | "hero";

export type RewardsStickerLabeledSize = Extract<RewardsStickerSize, "headline" | "hero">;

interface RewardsStickerBaseProps {
  items: RewardTokenItem[];
  chainName: string;
  phase: RewardsPhase;
}

export type RewardsStickerProps = RewardsStickerBaseProps &
  (
    | { size: Exclude<RewardsStickerSize, RewardsStickerLabeledSize> }
    | { size: RewardsStickerLabeledSize; audience: RewardsAudience }
  );
