import { FundPoolToken, getFundTokenKey } from "@components/_pages/Create/sections/Rewards/components/FundPool/store";
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
import { didUserReject } from "utils/error";
import { erc20Abi, parseUnits } from "viem";
import { RewardPoolData } from "../../slices/contestCreateRewards";
import { TransactionStatus } from "../../types";
import { ATTACH_RETRY_DELAY_MS, DEPLOY_RETRY_DELAY_MS, MAX_ATTACH_ATTEMPTS, MAX_DEPLOY_ATTEMPTS } from "./constants";

interface DeployRewardsModuleParams {
  contestAddress: string;
  chainId: number;
  userAddress: `0x${string}`;
  rewardPoolData: RewardPoolData;
  onStatusUpdate: (status: TransactionStatus, hash?: string, error?: string) => void;
}

interface AttachRewardsModuleParams {
  contestAddress: string;
  chainId: number;
  rewardsModuleAddress: string;
  onStatusUpdate: (status: TransactionStatus, hash?: string, error?: string) => void;
}

interface FundPoolTokensParams {
  contestAddress: string;
  chainId: number;
  rewardsModuleAddress: string;
  tokenWidgets: FundPoolToken[];
  onTokenStatusUpdate: (tokenKey: string, status: TransactionStatus, hash?: string, error?: string) => void;
}

export const deployRewardsModule = async (params: DeployRewardsModuleParams): Promise<string> => {
  const { contestAddress, chainId, userAddress, rewardPoolData, onStatusUpdate } = params;

  try {
    onStatusUpdate("loading");
    const baseParams = [rewardPoolData.rankings, rewardPoolData.shareAllocations, contestAddress];

    let contractRewardsModuleHash: `0x${string}` | undefined;

    for (let attempt = 1; attempt <= MAX_DEPLOY_ATTEMPTS; attempt++) {
      try {
        contractRewardsModuleHash = await deployContract(getWagmiConfig(), {
          abi: VotingModuleContract.abi,
          bytecode: VotingModuleContract.bytecode.object as `0x${string}`,
          args: [...baseParams],
          account: userAddress,
          chainId,
        });
        break;
      } catch (error) {
        if (didUserReject(error) || attempt === MAX_DEPLOY_ATTEMPTS) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, DEPLOY_RETRY_DELAY_MS * attempt));
      }
    }

    if (!contractRewardsModuleHash) {
      throw new Error("Failed to submit rewards module deployment transaction");
    }

    const receipt = await waitForTransactionReceipt(getWagmiConfig(), {
      hash: contractRewardsModuleHash,
      confirmations: 2,
      chainId,
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

    let hash: `0x${string}` | undefined;

    for (let attempt = 1; attempt <= MAX_ATTACH_ATTEMPTS; attempt++) {
      try {
        const { request } = await simulateContract(getWagmiConfig(), {
          ...contractConfig,
          functionName: "setOfficialRewardsModule",
          args: [rewardsModuleAddress as `0x${string}`],
        });

        hash = await writeContract(getWagmiConfig(), request);
        break;
      } catch (error) {
        if (didUserReject(error) || attempt === MAX_ATTACH_ATTEMPTS) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, ATTACH_RETRY_DELAY_MS * attempt));
      }
    }

    if (!hash) {
      throw new Error("Failed to submit attach rewards module transaction");
    }

    await waitForTransactionReceipt(getWagmiConfig(), { hash, confirmations: 2, chainId });

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
    onTokenStatusUpdate(getFundTokenKey(token), "pending");
  }

  for (const token of validTokens) {
    const transactionKey = getFundTokenKey(token);
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
