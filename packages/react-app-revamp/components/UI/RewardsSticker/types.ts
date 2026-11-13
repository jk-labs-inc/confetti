import { TokenItem } from "@hooks/useCurrency/useTotalRewardsUsd";
import { RewardsAudience, RewardsPhase } from "lib/rewards/types";

export type RewardsStickerSize = "card" | "stat" | "headline" | "bar";

export type RewardsStickerInlineSize = Extract<RewardsStickerSize, "headline" | "bar">;

interface RewardsStickerBaseProps {
  items: TokenItem[];
  chainName: string;
  phase: RewardsPhase;
}

export type RewardsStickerProps = RewardsStickerBaseProps &
  (
    | { size: Exclude<RewardsStickerSize, RewardsStickerInlineSize> }
    | { size: RewardsStickerInlineSize; audience: RewardsAudience }
  );
