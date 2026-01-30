import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import DeployedContestContract from "@contracts/bytecodeAndAbi//Contest.sol/Contest.json";
import { deployContract, waitForTransactionReceipt } from "@wagmi/core";
import { isSortingEnabled } from "../contracts";
import { prepareConstructorArgs } from "../helpers/constructorArgs";

export const deployContractToChain = async (
  constructorArgs: ReturnType<typeof prepareConstructorArgs>,
  address: `0x${string}`,
) => {
  const contractDeploymentHash = await deployContract(getWagmiConfig(), {
    abi: DeployedContestContract.abi,
    bytecode: DeployedContestContract.bytecode.object as `0x${string}`,
    args: [constructorArgs],
    account: address,
  });

  const receipt = await waitForTransactionReceipt(getWagmiConfig(), {
    hash: contractDeploymentHash,
    confirmations: 2,
  });

  const contractAddress = receipt?.contractAddress;
  if (!contractAddress) {
    throw new Error("Contract deployment failed - no contract address returned");
  }

  return { contractDeploymentHash, contractAddress: contractAddress.toLowerCase() };
};

export const finalizeContractDeployment = async (contractAddress: string, chainId: number) => {
  const sortingEnabled = await isSortingEnabled(contractAddress, chainId);
  return { sortingEnabled };
};
