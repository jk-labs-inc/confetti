import { Reward } from "@components/_pages/Contest/Rewards/types";
import { isSameAddress } from "@helpers/isSameAddress";
import { toPriceUnits, VoteCurrency } from "lib/voteCurrency";

const NATIVE_REWARD_ADDRESS = "native";

const voteCurrencyRewardAddress = (voteCurrency: VoteCurrency): string =>
  voteCurrency.kind === "token" ? voteCurrency.address : NATIVE_REWARD_ADDRESS;

export function sumVoteCurrencyRewards(voteCurrency: VoteCurrency, rewards: Reward[]): bigint {
  const rewardAddress = voteCurrencyRewardAddress(voteCurrency);
  let total = 0n;

  for (const reward of rewards) {
    if (isSameAddress(reward.address, rewardAddress)) {
      total += reward.value;
    }
  }

  return toPriceUnits(voteCurrency, total);
}
