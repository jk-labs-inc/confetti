import { ContestVoteEvent, ContestVoteLedgerData } from "@hooks/useContestVoteLedger/types";
import { Abi, AbiEvent } from "viem";
import { resolveScanRange } from "./blocks";
import { fetchCastDetails, findUnrecordedLogs } from "./casts";
import { getLogsInChunks, getPrimaryRpcClient, toChainVoteLog } from "./logs";
import { ChainVoteCastsData, ChainVoteLog } from "./types";

interface FetchChainVoteCastsParams {
  contest: {
    address: `0x${string}`;
    abi: Abi;
    chainId: number;
  };
  scanFromSec: bigint;
  voteEndSec: bigint;
  recordedCasts: ContestVoteEvent[];
  previous: ChainVoteCastsData | undefined;
}

const isVoteCastEvent = (item: Abi[number]): item is AbiEvent => item.type === "event" && item.name === "VoteCast";

export const resolveScanFromSec = (recorded: ContestVoteLedgerData | undefined, voteStartSec: bigint): bigint => {
  const oldestLoadedAt = recorded?.isTruncated ? recorded.casts[0]?.createdAt : undefined;
  if (oldestLoadedAt === undefined) return voteStartSec;
  const oldestLoadedSec = BigInt(Math.floor(oldestLoadedAt));
  return oldestLoadedSec > voteStartSec ? oldestLoadedSec : voteStartSec;
};

export async function fetchChainVoteCasts({
  contest,
  scanFromSec,
  voteEndSec,
  recordedCasts,
  previous,
}: FetchChainVoteCastsParams): Promise<ChainVoteCastsData> {
  const client = getPrimaryRpcClient(contest.chainId);
  const event = contest.abi.find(isVoteCastEvent);
  if (!client || !event) throw new Error("fetchChainVoteCasts: no client or VoteCast event for this contest");

  const resumed = previous && previous.scanFromSec <= scanFromSec ? previous : undefined;
  let scanned: Omit<ChainVoteCastsData, "detailsByTx">;
  if (resumed?.isComplete) {
    scanned = resumed;
  } else {
    const range = await resolveScanRange(client, resumed?.scannedToBlock ?? null, scanFromSec, voteEndSec);
    const hasNewBlocks = range.fromBlock <= range.toBlock;
    const newLogs: ChainVoteLog[] = hasNewBlocks
      ? (
          await getLogsInChunks(
            (from, to) => client.getLogs({ address: contest.address, event, fromBlock: from, toBlock: to }),
            range.fromBlock,
            range.toBlock,
          )
        ).flatMap(toChainVoteLog)
      : [];
    scanned = {
      logs: resumed ? [...resumed.logs, ...newLogs] : newLogs,
      scanFromSec: resumed?.scanFromSec ?? scanFromSec,
      scannedToBlock: hasNewBlocks || !resumed ? range.toBlock : resumed.scannedToBlock,
      recordedCutoffSec: Math.max(range.recordedCutoffSec, resumed?.recordedCutoffSec ?? 0),
      isComplete: range.isComplete,
    };
  }

  const unrecorded = findUnrecordedLogs(scanned.logs, recordedCasts, scanned.recordedCutoffSec);
  const detailsByTx = await fetchCastDetails(client, unrecorded, contest.address, contest.chainId);
  return { ...scanned, detailsByTx };
}
