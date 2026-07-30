import { FundPoolToken } from "@components/_pages/Create/sections/Rewards/components/FundPool/store";
import { chains } from "@config/wagmi";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { extractPathSegments } from "@helpers/extractPath";
import { useError } from "@hooks/useError";
import useRewardsModule from "@hooks/useRewards";
import { useTotalRewards } from "@hooks/useTotalRewards";
import { useWallet } from "@hooks/useWallet";
import {
  estimateGas,
  sendTransaction,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
  type WaitForTransactionReceiptReturnType,
} from "@wagmi/core";
import { updateRewardAnalytics } from "lib/analytics/rewards";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { erc20Abi, parseUnits } from "viem";
import { useFundRewardsStore } from "./store";

export interface RewardData {
  currentUserAddress: string;
  tokenAddress: string | null;
  isErc20: boolean;
  amount: string;
  rewardsContractAddress?: string;
}

export function useFundRewardsModule() {
  const asPath = usePathname();
  const { chainName, address: contestAddress } = extractPathSegments(asPath ?? "");
  const chainId = chains.filter(
    (chain: { name: string }) => chain.name.toLowerCase().replace(" ", "") === chainName,
  )?.[0]?.id;
  const { chain } = useWallet();
  const {
    isModalOpen,
    isLoading,
    error,
    isSuccess,
    transactionData,
    setIsLoading,
    setIsSuccess,
    setError,
    setTransactionData,
  } = useFundRewardsStore(state => state);
  const { error: errorMessage, handleError } = useError();
  const { data: rewards } = useRewardsModule();
  const { refetch: refetchTotalRewards } = useTotalRewards({
    rewardsModuleAddress: rewards?.contractAddress as `0x${string}`,
    rewardsModuleAbi: rewards?.abi,
    chainId,
  });

  const sendFundsToRewardsModuleV3 = (rewards: FundPoolToken[]) => {
    const promises = rewards.map((reward: FundPoolToken) => {
      return () =>
        sendFundsToSingleReward(reward)
          .then(async result => {
            setTransactionData((prevData: any) => [...prevData, result]);
          })
          .catch(e => {
            handleError(e, `Something went wrong while sending funds for reward ${reward}.`);
            setError(errorMessage);
            setIsSuccess(false);
            setIsLoading(false);
            throw e;
          });
    });
    return promises;
  };

  const sendFundsToSingleReward = async (args: FundPoolToken) => {
    setIsLoading(true);
    setIsSuccess(false);

    const { address: tokenAddress, amount: tokenAmount, decimals: tokenDecimals } = args;
    const contractConfig = {
      address: tokenAddress as `0x${string}`,
      chainId: chainId,
      abi: erc20Abi,
    };

    let hash: `0x${string}`;
    let receipt: WaitForTransactionReceiptReturnType;

    if (tokenAddress === "native") {
      const amountBigInt = parseUnits(tokenAmount, tokenDecimals);

      await estimateGas(getWagmiConfig(), {
        to: rewards?.contractAddress as `0x${string}`,
        chainId: chainId,
        value: amountBigInt,
      });

      const hash = await sendTransaction(getWagmiConfig(), {
        to: rewards?.contractAddress as `0x${string}`,
        chainId: chainId,
        value: amountBigInt,
      });

      receipt = await waitForTransactionReceipt(getWagmiConfig(), {
        chainId: chainId,
        hash: hash,
        confirmations: 2,
      });
    } else {
      const amountBigInt = parseUnits(tokenAmount, tokenDecimals);

      const { request } = await simulateContract(getWagmiConfig(), {
        ...contractConfig,
        functionName: "transfer",
        chainId: chainId,
        args: [rewards?.contractAddress as `0x${string}`, amountBigInt],
      });

      hash = await writeContract(getWagmiConfig(), {
        ...request,
      });

      receipt = await waitForTransactionReceipt(getWagmiConfig(), {
        chainId: chainId,
        hash: hash,
        confirmations: 2,
      });
    }

    try {
      await updateRewardAnalytics({
        contest_address: contestAddress,
        rewards_module_address: rewards?.contractAddress ?? "",
        network_name: chainName,
        amount: parseFloat(tokenAmount),
        operation: "deposit",
        token_address: tokenAddress === "native" ? null : tokenAddress,
        created_at: Math.floor(Date.now() / 1000),
      });
    } catch (error) {
      console.error("Error while updating reward analytics", error);
    }

    refetchTotalRewards();
    setIsLoading(false);
    setIsSuccess(true);

    return {
      hash: receipt.transactionHash,
      chainId: chainId,
      transactionHref: `${chain?.blockExplorers?.default?.url}/tx/${receipt.transactionHash}`,
    };
  };

  useEffect(() => {
    if (!isModalOpen) {
      setIsLoading(false);
      setIsSuccess(false);
      setTransactionData({});
      setError("");
    }
  }, [isModalOpen, setError, setIsLoading, setIsSuccess, setTransactionData]);

  return {
    sendFundsToRewardsModuleV3,
    isLoading,
    error,
    isSuccess,
    transactionData,
  };
}

export default useFundRewardsModule;
