import { getChainFromId } from "@helpers/getChainFromId";
import { BaseError, createPublicClient, formatEther, http, HttpRequestError, Log, PublicClient } from "viem";
import {
  LOG_QUERY_CONCURRENCY,
  LOG_QUERY_MAX_BLOCK_SPAN,
  LOG_RANGE_LIMIT_HTTP_STATUS,
  LOG_RANGE_LIMIT_RPC_CODE,
  MIN_LOG_CHUNK_BLOCKS,
} from "./constants";
import { ChainVoteLog } from "./types";

type FetchRange<T> = (fromBlock: bigint, toBlock: bigint) => Promise<T[]>;

interface VoteCastArgs {
  voter?: string;
  proposalId?: bigint;
  numVotes?: bigint;
}

const clientsByChain = new Map<number, PublicClient>();

export function getPrimaryRpcClient(chainId: number): PublicClient | undefined {
  const cached = clientsByChain.get(chainId);
  if (cached) return cached;

  const chain = getChainFromId(chainId);
  const rpcUrl = chain?.rpcUrls.default.http[0];

  if (!chain || !rpcUrl) return undefined;
  const client = createPublicClient({ chain, transport: http(rpcUrl) }) as PublicClient;
  clientsByChain.set(chainId, client);
  return client;
}

const isLogRangeLimitError = (error: unknown): boolean =>
  error instanceof BaseError &&
  error.walk(
    cause =>
      (cause as { code?: unknown } | null)?.code === LOG_RANGE_LIMIT_RPC_CODE ||
      (cause instanceof HttpRequestError && cause.status === LOG_RANGE_LIMIT_HTTP_STATUS),
  ) !== null;

async function fetchSplittingOnRangeLimit<T>(
  fetchRange: FetchRange<T>,
  fromBlock: bigint,
  toBlock: bigint,
): Promise<T[]> {
  try {
    return await fetchRange(fromBlock, toBlock);
  } catch (error) {
    if (!isLogRangeLimitError(error) || toBlock - fromBlock < MIN_LOG_CHUNK_BLOCKS) throw error;
    const middle = fromBlock + (toBlock - fromBlock) / 2n;
    const left = await fetchSplittingOnRangeLimit(fetchRange, fromBlock, middle);
    const right = await fetchSplittingOnRangeLimit(fetchRange, middle + 1n, toBlock);
    return [...left, ...right];
  }
}

export async function getLogsInChunks<T>(fetchRange: FetchRange<T>, fromBlock: bigint, toBlock: bigint): Promise<T[]> {
  const windows: Array<[bigint, bigint]> = [];
  for (let start = fromBlock; start <= toBlock; start += LOG_QUERY_MAX_BLOCK_SPAN + 1n) {
    const end = start + LOG_QUERY_MAX_BLOCK_SPAN;
    windows.push([start, end < toBlock ? end : toBlock]);
  }

  const results: T[][] = new Array(windows.length);
  let nextWindow = 0;
  const worker = async () => {
    while (nextWindow < windows.length) {
      const index = nextWindow++;
      results[index] = await fetchSplittingOnRangeLimit(fetchRange, windows[index][0], windows[index][1]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(LOG_QUERY_CONCURRENCY, windows.length) }, worker));
  return results.flat();
}

export const toChainVoteLog = (log: Log): ChainVoteLog[] => {
  const { voter, proposalId, numVotes } = ((log as Log & { args?: VoteCastArgs }).args ?? {}) as VoteCastArgs;
  if (!voter || proposalId === undefined || numVotes === undefined) return [];
  if (log.blockNumber === null || log.logIndex === null || log.transactionHash === null) return [];
  return [
    {
      voter: voter.toLowerCase(),
      proposalId: proposalId.toString(),
      votes: Number(formatEther(numVotes)),
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
      txHash: log.transactionHash,
      blockTimestamp: log.blockTimestamp != null ? Number(log.blockTimestamp) : null,
    },
  ];
};
