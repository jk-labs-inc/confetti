import { FundPoolToken } from "@components/_pages/Create/sections/Rewards/components/FundPool/store";
import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import DeployedContestContract from "@contracts/bytecodeAndAbi/Contest.sol/Contest.json";
import VotingModuleContract from "@contracts/bytecodeAndAbi/modules/VoterRewardsModule.sol/VoterRewardsModule.json";
import { getChainFromId } from "@helpers/getChainFromId";
import {
  deployContract,
  estimateGas,
  sendTransaction,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { updateRewardAnalytics } from "lib/analytics/rewards";
import { erc20Abi, parseUnits } from "viem";
import { RewardPoolData } from "../../slices/contestCreateRewards";

interface DeployRewardsModuleParams {
  contestAddress: string;
  chainId: number;
  userAddress: `0x${string}`;
  rewardPoolData: RewardPoolData;
  onStatusUpdate: (status: "loading" | "success" | "error", hash?: string, error?: string) => void;
}

interface AttachRewardsModuleParams {
  contestAddress: string;
  chainId: number;
  rewardsModuleAddress: string;
  onStatusUpdate: (status: "loading" | "success" | "error", hash?: string, error?: string) => void;
}

interface FundPoolTokensParams {
  contestAddress: string;
  chainId: number;
  rewardsModuleAddress: string;
  tokenWidgets: FundPoolToken[];
  onTokenStatusUpdate: (
    tokenKey: string,
    status: "loading" | "success" | "error",
    hash?: string,
    error?: string,
  ) => void;
}

export const deployRewardsModule = async (params: DeployRewardsModuleParams): Promise<string> => {
  const { contestAddress, chainId, userAddress, rewardPoolData, onStatusUpdate } = params;

  try {
    onStatusUpdate("loading");
    const baseParams = [rewardPoolData.rankings, rewardPoolData.shareAllocations, contestAddress];

    const contractRewardsModuleHash = await deployContract(getWagmiConfig(), {
      abi: VotingModuleContract.abi,
      bytecode: VotingModuleContract.bytecode.object as `0x${string}`,
      args: [...baseParams],
      account: userAddress,
      chainId,
    });

    const receipt = await waitForTransactionReceipt(getWagmiConfig(), {
      hash: contractRewardsModuleHash,
      confirmations: 2,
    });

    const contractRewardsModuleAddress = receipt?.contractAddress;
    if (!contractRewardsModuleAddress) {
      throw new Error("Failed to deploy rewards module - no contract address returned");
    }

    onStatusUpdate("success", contractRewardsModuleHash);

    return contractRewardsModuleAddress.toLowerCase();
  } catch (error: any) {
    onStatusUpdate("error", undefined, error.message);
    throw error;
  }
};

export const attachRewardsModule = async (params: AttachRewardsModuleParams): Promise<void> => {
  const { contestAddress, chainId, rewardsModuleAddress, onStatusUpdate } = params;

  try {
    onStatusUpdate("loading");
    const contractConfig = {
      address: contestAddress as `0x${string}`,
      chainId,
      abi: DeployedContestContract.abi,
    };

    const { request } = await simulateContract(getWagmiConfig(), {
      ...contractConfig,
      functionName: "setOfficialRewardsModule",
      args: [rewardsModuleAddress as `0x${string}`],
    });

    const hash = await writeContract(getWagmiConfig(), request!);
    await waitForTransactionReceipt(getWagmiConfig(), { hash, confirmations: 2 });

    onStatusUpdate("success", hash);
  } catch (error: any) {
    console.error("Error while attaching rewards module", error);
    onStatusUpdate("error", undefined, error.message);
    throw error;
  }
};

export const fundPoolTokens = async (params: FundPoolTokensParams): Promise<void> => {
  const { contestAddress, chainId, rewardsModuleAddress, tokenWidgets, onTokenStatusUpdate } = params;
  const chainName = getChainFromId(chainId)?.name.toLowerCase();

  const validTokens = tokenWidgets.filter(token => parseFloat(token.amount) > 0);

  if (validTokens.length === 0) {
    return;
  }

  for (const token of validTokens) {
    const transactionKey = `fund_${token.symbol}`;
    onTokenStatusUpdate(transactionKey, "loading");

    try {
      let hash: `0x${string}`;
      let receipt;

      const fundPoolContractConfig = {
        address: token.address as `0x${string}`,
        chainId,
        abi: erc20Abi,
      };

      if (token.address === "native") {
        const amountBigInt = parseUnits(token.amount, token.decimals);

        await estimateGas(getWagmiConfig(), {
          to: rewardsModuleAddress as `0x${string}`,
          chainId,
          value: amountBigInt,
        });

        hash = await sendTransaction(getWagmiConfig(), {
          to: rewardsModuleAddress as `0x${string}`,
          chainId,
          value: amountBigInt,
        });

        receipt = await waitForTransactionReceipt(getWagmiConfig(), { chainId, hash, confirmations: 2 });
      } else {
        const amountBigInt = parseUnits(token.amount, token.decimals);

        const { request } = await simulateContract(getWagmiConfig(), {
          ...fundPoolContractConfig,
          functionName: "transfer",
          args: [rewardsModuleAddress as `0x${string}`, amountBigInt],
        });

        hash = await writeContract(getWagmiConfig(), { ...request });
        receipt = await waitForTransactionReceipt(getWagmiConfig(), { chainId, hash, confirmations: 2 });
      }

      onTokenStatusUpdate(transactionKey, "success", hash);

      try {
        await updateRewardAnalytics({
          contest_address: contestAddress,
          rewards_module_address: rewardsModuleAddress,
          network_name: chainName ?? "",
          amount: parseFloat(token.amount),
          operation: "deposit",
          token_address: token.address === "native" ? null : token.address,
          created_at: Math.floor(Date.now() / 1000),
        });
      } catch (error) {
        console.error("Error while updating reward analytics", error);
      }
    } catch (error: any) {
      onTokenStatusUpdate(transactionKey, "error", undefined, error.message);
    }
  }
};
