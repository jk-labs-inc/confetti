import { chains } from "@config/wagmi/chains";
import { Charge } from "@hooks/useDeployContest/types";
import { formatEther } from "viem";

interface ComputeJkLabsRevenueUsdParams {
  totalChargeWei: bigint;
  chainId: number;
  voteCurrencyUsdRate: number | undefined;
  charge: Charge;
  isRewardsPoolSelfFunded: boolean;
  isCreatorSplitEnabled: boolean;
}

export const computeJkLabsRevenueUsd = ({
  totalChargeWei,
  chainId,
  voteCurrencyUsdRate,
  charge,
  isRewardsPoolSelfFunded,
  isCreatorSplitEnabled,
}: ComputeJkLabsRevenueUsdParams): number => {
  const chain = chains.find(c => c.id === chainId);

  if (chain?.testnet) return 0;

  if (!voteCurrencyUsdRate) return 0;

  const totalChargeNative = Number(formatEther(totalChargeWei));
  const totalChargeUsd = totalChargeNative * voteCurrencyUsdRate;

  let percentageToJkLabs: number;
  if (isRewardsPoolSelfFunded) {
    percentageToJkLabs = 100 - charge.percentageToRewards;
    if (isCreatorSplitEnabled) {
      percentageToJkLabs = percentageToJkLabs / 2;
    }
  } else {
    percentageToJkLabs = 100;
  }

  return totalChargeUsd * (percentageToJkLabs / 100);
};
