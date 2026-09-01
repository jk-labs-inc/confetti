import { toastLoading, toastSuccess } from "@components/UI/Toast";
import { LoadingToastMessageType } from "@components/UI/Toast/components/Loading";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { extractPathSegments } from "@helpers/extractPath";
import { transform } from "@helpers/transform";
import { useError } from "@hooks/useError";
import { useWallet } from "@hooks/useWallet";
import { useQueryClient } from "@tanstack/react-query";
import { switchChain, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { updateRewardAnalytics } from "lib/analytics/rewards";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Abi } from "viem";

interface UseClaimRewardsProps {
  contractRewardsModuleAddress: `0x${string}`;
  abiRewardsModule: Abi;
  chainId: number;
  tokenDecimals: number;
  userAddress?: `0x${string}`;
}

type ClaimKey = string;
type ClaimState = Record<ClaimKey, boolean>;

export const useClaimRewards = ({
  contractRewardsModuleAddress,
  abiRewardsModule,
  chainId,
  tokenDecimals,
  userAddress,
}: UseClaimRewardsProps) => {
  const { chain: userChain } = useWallet();
  const asPath = usePathname();
  const { chainName, address: contestAddress } = extractPathSegments(asPath ?? "");
  const { handleError } = useError();
  const queryClient = useQueryClient();
  const [loadingStates, setLoadingStates] = useState<ClaimState>({});
  const [successStates, setSuccessStates] = useState<ClaimState>({});

  const setLoading = (payee: number, tokenAddress: string, isLoading: boolean) => {
    const key = `${userAddress}-${payee}-${tokenAddress}`;
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  };

  const setSuccess = (payee: number, tokenAddress: string, isSuccess: boolean) => {
    const key = `${userAddress}-${payee}-${tokenAddress}`;
    setSuccessStates(prev => ({ ...prev, [key]: isSuccess }));
  };

  const claimRewards = async (
    payee: number,
    tokenBalance: bigint,
    tokenAddress: string,
    voterAddress?: `0x${string}`,
  ) => {
    setLoading(payee, tokenAddress, true);
    setSuccess(payee, tokenAddress, false);
    toastLoading({
      message: "Claiming rewards...",
      additionalMessageType: LoadingToastMessageType.KEEP_BROWSER_OPEN,
    });
    const amountReleasableFormatted = transform(tokenBalance, tokenAddress, tokenDecimals);

    if (userChain?.id && userChain?.id !== chainId) {
      await switchChain(getWagmiConfig(), { chainId });
    }

    try {
      const args = tokenAddress === "native" ? [voterAddress, payee] : [tokenAddress, voterAddress, payee];

      const hash = await writeContract(getWagmiConfig(), {
        address: contractRewardsModuleAddress,
        abi: abiRewardsModule,
        functionName: "release",
        args,
        chainId,
      });

      await waitForTransactionReceipt(getWagmiConfig(), { hash, confirmations: 2 });

      setLoading(payee, tokenAddress, false);
      setSuccess(payee, tokenAddress, true);
      toastSuccess({
        message: "Rewards claimed successfully!",
      });

      queryClient.invalidateQueries({ queryKey: ["claimableRewards", contractRewardsModuleAddress] });
      queryClient.invalidateQueries({ queryKey: ["claimedRewards", contractRewardsModuleAddress] });

      try {
        await updateRewardAnalytics({
          contest_address: contestAddress,
          rewards_module_address: contractRewardsModuleAddress,
          network_name: chainName,
          amount: amountReleasableFormatted,
          operation: "distribute",
          token_address: tokenAddress === "native" ? null : tokenAddress,
          created_at: Math.floor(Date.now() / 1000),
        });
      } catch (error) {
        console.error("Error while updating reward analytics", error);
      }
    } catch (error) {
      handleError(error, "Error while claiming rewards");
      setLoading(payee, tokenAddress, false);
    }
  };

  const isLoading = (payee: number, tokenAddress: string) =>
    loadingStates[`${userAddress}-${payee}-${tokenAddress}`] || false;
  const isSuccess = (payee: number, tokenAddress: string) =>
    successStates[`${userAddress}-${payee}-${tokenAddress}`] || false;

  return {
    claimRewards,
    isLoading,
    isSuccess,
  };
};
