import { getChainFromId } from "@helpers/getChainFromId";
import { Config, estimateGas } from "@wagmi/core";
import { BaseError, encodeDeployData } from "viem";

const GAS_ESTIMATE_MARGIN_PERCENT = 2n;
const GAS_CAP_REJECTION_MARKER = "gas required exceeds";

interface DeploymentGasRequest {
  chainId: number;
  account: `0x${string}`;
  deployment: {
    abi: readonly unknown[];
    bytecode: `0x${string}`;
    args: readonly unknown[];
  };
}

export class TransactionGasCapExceededError extends Error {
  constructor(chainName: string, transactionGasCap: bigint) {
    super(`this deployment needs more than the ${transactionGasCap} gas a transaction may use on ${chainName}`);
    this.name = "TransactionGasCapExceededError";
  }
}

const isGasCapRejection = (error: unknown, transactionGasCap: bigint): boolean => {
  if (!(error instanceof Error)) return false;
  const rejection = error instanceof BaseError ? `${error.message} ${error.details}` : error.message;

  return rejection.includes(GAS_CAP_REJECTION_MARKER) && rejection.includes(transactionGasCap.toString());
};

const withinGasCap = (estimatedGas: bigint, transactionGasCap: bigint): bigint => {
  const paddedGas = estimatedGas + (estimatedGas * GAS_ESTIMATE_MARGIN_PERCENT) / 100n;
  return paddedGas < transactionGasCap ? paddedGas : transactionGasCap;
};

export async function deploymentGasLimit(
  config: Config,
  { chainId, account, deployment }: DeploymentGasRequest,
): Promise<bigint | undefined> {
  const chain = getChainFromId(chainId);
  const transactionGasCap = chain?.transactionGasCap;
  if (!chain || transactionGasCap === undefined) return undefined;

  const estimatedGas = await estimateGas(config, { chainId, account, data: encodeDeployData(deployment) }).catch(
    (error: unknown) => {
      throw isGasCapRejection(error, transactionGasCap)
        ? new TransactionGasCapExceededError(chain.name, transactionGasCap)
        : error;
    },
  );

  if (estimatedGas > transactionGasCap) throw new TransactionGasCapExceededError(chain.name, transactionGasCap);

  return withinGasCap(estimatedGas, transactionGasCap);
}
