import { getWagmiConfig } from "@getpara/evm-wallet-connectors";
import { getBalance, getBlockNumber, getGasPrice, getPublicClient, readContract } from "@wagmi/core";
import { compareVersions } from "compare-versions";
import { spendableWei } from "lib/voteBalance/spendable";
import { type Address, type Hash, TransactionNotFoundError } from "viem";
import { BLOCK_CATCH_UP_POLL_MS, BLOCK_CATCH_UP_TIMEOUT_MS } from "./constants";
import type { ContestTarget, ReceiptStatus } from "./types";

const DOWNVOTES_REMOVED_IN = "5.1";

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isVotePair = (value: unknown): value is readonly [bigint, bigint] =>
  Array.isArray(value) && value.length === 2 && typeof value[0] === "bigint" && typeof value[1] === "bigint";

export const readUserVotes = async ({
  contest,
  proposalId,
  wallet,
}: {
  contest: ContestTarget;
  proposalId: string;
  wallet: Address;
}): Promise<bigint> => {
  const votes: unknown = await readContract(getWagmiConfig(), {
    address: contest.address,
    abi: contest.abi,
    chainId: contest.chainId,
    functionName: "proposalAddressVotes",
    args: [BigInt(proposalId), wallet],
  });
  const hasDownvotes = !!contest.version && compareVersions(contest.version, DOWNVOTES_REMOVED_IN) < 0;
  if (hasDownvotes && isVotePair(votes)) return votes[0] - votes[1];
  if (typeof votes === "bigint") return votes;
  throw new Error("unexpected proposalAddressVotes result");
};

export const readPricePerVote = async (contest: ContestTarget): Promise<bigint> => {
  const price: unknown = await readContract(getWagmiConfig(), {
    address: contest.address,
    abi: contest.abi,
    chainId: contest.chainId,
    functionName: "currentPricePerVote",
  });
  if (typeof price !== "bigint") throw new Error("unexpected currentPricePerVote result");
  return price;
};

export const readSpendableAfter = async ({
  wallet,
  chainId,
  minBlock,
}: {
  wallet: Address;
  chainId: number;
  minBlock: bigint;
}): Promise<bigint> => {
  const config = getWagmiConfig();
  const deadline = Date.now() + BLOCK_CATCH_UP_TIMEOUT_MS;
  for (;;) {
    const observed = await getBlockNumber(config, { chainId, cacheTime: 0 });
    if (observed >= minBlock) {
      const balance = await getBalance(config, { address: wallet, chainId, blockNumber: observed }).catch(() => null);
      if (balance)
        return spendableWei({ balanceWei: balance.value, gasPriceWei: await getGasPrice(config, { chainId }) });
    }
    if (Date.now() > deadline) throw new Error("the network hasn't caught up with your payout yet");
    await sleep(BLOCK_CATCH_UP_POLL_MS);
  }
};

export const waitForReceiptStatus = async ({
  hash,
  chainId,
  timeoutMs,
  confirmations,
}: {
  hash: Hash;
  chainId: number;
  timeoutMs: number;
  confirmations: number;
}): Promise<ReceiptStatus> => {
  const client = getPublicClient(getWagmiConfig(), { chainId });
  if (!client) throw new Error(`no client for chain ${chainId}`);
  const receipt = await client.waitForTransactionReceipt({ hash, confirmations, timeout: Math.max(timeoutMs, 1) });
  return receipt.status === "success"
    ? { status: "success", blockNumber: receipt.blockNumber }
    : { status: "reverted" };
};

export const isTransactionKnown = async ({ hash, chainId }: { hash: Hash; chainId: number }): Promise<boolean> => {
  const client = getPublicClient(getWagmiConfig(), { chainId });
  if (!client) throw new Error(`no client for chain ${chainId}`);
  try {
    await client.getTransaction({ hash });
    return true;
  } catch (error) {
    if (error instanceof TransactionNotFoundError) return false;
    throw error;
  }
};
