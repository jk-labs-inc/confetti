import { ContestVoteEvent } from "@hooks/useContestVoteLedger/types";
import { formatEther, PublicClient } from "viem";
import {
  CAST_DETAILS_CONCURRENCY,
  CAST_MATCH_MIN_VOTES,
  CAST_MATCH_RELATIVE_TOLERANCE,
  CHAIN_CAST_UUID_PREFIX,
} from "./constants";
import { ChainCastDetails, ChainVoteCastsData, ChainVoteLog } from "./types";

type ReadBlockTimestamp = (blockNumber: bigint) => Promise<number>;

const detailsCache = new Map<string, ChainCastDetails>();

const castKey = (voter: string, proposalId: string) => `${voter.toLowerCase()}:${proposalId}`;

const isSameVoteAmount = (recorded: number, onChain: number): boolean =>
  Math.abs(recorded - onChain) <= Math.max(CAST_MATCH_MIN_VOTES, onChain * CAST_MATCH_RELATIVE_TOLERANCE);

const compareLogsAscending = (a: ChainVoteLog, b: ChainVoteLog): number =>
  a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber < b.blockNumber ? -1 : 1;

export function findUnrecordedLogs(
  logs: ChainVoteLog[],
  recordedCasts: ContestVoteEvent[],
  recordedCutoffSec: number,
): ChainVoteLog[] {
  const recordedByKey = new Map<string, ContestVoteEvent[]>();
  for (const cast of recordedCasts) {
    if (cast.createdAt > recordedCutoffSec) continue;
    const key = castKey(cast.userAddress, cast.proposalId);
    const bucket = recordedByKey.get(key);
    if (bucket) bucket.push(cast);
    else recordedByKey.set(key, [cast]);
  }

  const unrecorded: ChainVoteLog[] = [];
  for (const log of [...logs].sort(compareLogsAscending)) {
    const bucket = recordedByKey.get(castKey(log.voter, log.proposalId));
    const matchIndex = bucket?.findIndex(cast => isSameVoteAmount(cast.voteAmount, log.votes)) ?? -1;
    if (bucket && matchIndex >= 0) bucket.splice(matchIndex, 1);
    else unrecorded.push(log);
  }
  return unrecorded;
}

const createBlockTimestampReader = (client: PublicClient): ReadBlockTimestamp => {
  const timestampsByBlock = new Map<bigint, Promise<number>>();
  return blockNumber => {
    let timestamp = timestampsByBlock.get(blockNumber);
    if (!timestamp) {
      timestamp = client.getBlock({ blockNumber }).then(block => Number(block.timestamp));
      timestampsByBlock.set(blockNumber, timestamp);
    }
    return timestamp;
  };
};

const readCastDetails = async (
  client: PublicClient,
  log: ChainVoteLog,
  contestAddress: string,
  isSoleCastInTx: boolean,
  readBlockTimestamp: ReadBlockTimestamp,
): Promise<ChainCastDetails> => {
  const [createdAt, transaction] = await Promise.all([
    log.blockTimestamp ?? readBlockTimestamp(log.blockNumber),
    client.getTransaction({ hash: log.txHash }).catch(() => null),
  ]);
  const paidContestDirectly = transaction?.to?.toLowerCase() === contestAddress.toLowerCase();
  return {
    createdAt,
    amountSent: transaction && paidContestDirectly && isSoleCastInTx ? Number(formatEther(transaction.value)) : null,
  };
};

export async function fetchCastDetails(
  client: PublicClient,
  logs: ChainVoteLog[],
  contestAddress: string,
  chainId: number,
): Promise<Map<string, ChainCastDetails>> {
  const castsPerTx = new Map<string, number>();
  for (const log of logs) castsPerTx.set(log.txHash, (castsPerTx.get(log.txHash) ?? 0) + 1);

  const detailsByTx = new Map<string, ChainCastDetails>();
  const pending: ChainVoteLog[] = [];
  const pendingTxHashes = new Set<string>();
  for (const log of logs) {
    if (detailsByTx.has(log.txHash) || pendingTxHashes.has(log.txHash)) continue;
    const cached = detailsCache.get(`${chainId}:${log.txHash}`);
    if (cached) {
      detailsByTx.set(log.txHash, cached);
    } else {
      pending.push(log);
      pendingTxHashes.add(log.txHash);
    }
  }

  const readBlockTimestamp = createBlockTimestampReader(client);

  for (let start = 0; start < pending.length; start += CAST_DETAILS_CONCURRENCY) {
    const batch = pending.slice(start, start + CAST_DETAILS_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(log =>
        readCastDetails(client, log, contestAddress, castsPerTx.get(log.txHash) === 1, readBlockTimestamp),
      ),
    );
    results.forEach((result, index) => {
      if (result.status !== "fulfilled") return;
      const txHash = batch[index].txHash;
      detailsCache.set(`${chainId}:${txHash}`, result.value);
      detailsByTx.set(txHash, result.value);
    });
  }

  return detailsByTx;
}

const toChainCast = (log: ChainVoteLog, details: ChainCastDetails): ContestVoteEvent => ({
  uuid: `${CHAIN_CAST_UUID_PREFIX}:${log.txHash}:${log.logIndex}`,
  userAddress: log.voter,
  proposalId: log.proposalId,
  proposalName: null,
  voteAmount: log.votes,
  amountSent: details.amountSent,
  createdAt: details.createdAt,
});

export const recoverUnrecordedCasts = (
  chainData: ChainVoteCastsData,
  recordedCasts: ContestVoteEvent[],
): ContestVoteEvent[] =>
  findUnrecordedLogs(chainData.logs, recordedCasts, chainData.recordedCutoffSec).flatMap(log => {
    const details = chainData.detailsByTx.get(log.txHash);
    return details ? [toChainCast(log, details)] : [];
  });
