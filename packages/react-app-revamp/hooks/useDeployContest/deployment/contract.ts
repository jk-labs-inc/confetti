import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import DeployedContestContract from "@contracts/bytecodeAndAbi//Contest.sol/Contest.json";
import { deployContract, waitForTransactionReceipt } from "@wagmi/core";
import { prepareConstructorArgs } from "../helpers/constructorArgs";
import { deploymentGasLimit } from "./gas";

export const deployContractToChain = async (
  constructorArgs: ReturnType<typeof prepareConstructorArgs>,
  address: `0x${string}`,
  chainId: number,
) => {
  const deployment = {
    abi: DeployedContestContract.abi,
    bytecode: DeployedContestContract.bytecode.object as `0x${string}`,
    args: [constructorArgs],
  };
  const gas = await deploymentGasLimit(getWagmiConfig(), { chainId, account: address, deployment });

  const contractDeploymentHash = await deployContract(getWagmiConfig(), {
    ...deployment,
    account: address,
    chainId,
    gas,
  });

  const receipt = await waitForTransactionReceipt(getWagmiConfig(), {
    hash: contractDeploymentHash,
    confirmations: 2,
    chainId,
  });

  const contractAddress = receipt?.contractAddress;
  if (!contractAddress) {
    throw new Error("Contract deployment failed - no contract address returned");
  }

  return { contractDeploymentHash, contractAddress: contractAddress.toLowerCase() };
};
