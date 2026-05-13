import { chains } from "@config/wagmi/chains";
import { Charge } from "@hooks/useDeployContest/types";
import { formatEther } from "viem";

interface ComputeJkLabsRevenueUsdParams {
  totalChargeWei: bigint;
  chainId: number;
  chainNativeCurrencySymbol: string;
  nativeRates: Record<string, number> | undefined;
  charge: Charge;
  isRewardsPoolSelfFunded: boolean;
  isCreatorSplitEnabled: boolean;
}

export const computeJkLabsRevenueUsd = ({
  totalChargeWei,
  chainId,
  chainNativeCurrencySymbol,
  nativeRates,
  charge,
  isRewardsPoolSelfFunded,
  isCreatorSplitEnabled,
}: ComputeJkLabsRevenueUsdParams): number => {
  const chain = chains.find(c => c.id === chainId);

  if (chain?.testnet) return 0;

  const rate = nativeRates?.[chainNativeCurrencySymbol.toLowerCase()];

  if (!rate) return 0;

  const totalChargeNative = Number(formatEther(totalChargeWei));
  const totalChargeUsd = totalChargeNative * rate;

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
