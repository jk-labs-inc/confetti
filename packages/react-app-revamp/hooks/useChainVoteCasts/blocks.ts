import { PublicClient } from "viem";
import {
  BLOCK_ESTIMATE_OVERSHOOT,
  BLOCK_ESTIMATE_UNDERSHOOT,
  BLOCK_TIME_SAMPLE_SPAN,
  LATE_CAST_WRITE_WINDOW_SEC,
  MAX_BLOCK_SEARCH_STEPS,
  MAX_BLOCK_TIGHTEN_STEPS,
  MIN_BLOCK_TIGHTEN_JUMP,
  MIN_SECONDS_PER_BLOCK,
} from "./constants";

interface BlockTimeline {
  latestNumber: bigint;
  latestTimestamp: bigint;
  secondsPerBlock: number;
}

export interface ScanRange {
  fromBlock: bigint;
  toBlock: bigint;
  recordedCutoffSec: number;
  isComplete: boolean;
}

async function getBlockTimeline(client: PublicClient): Promise<BlockTimeline> {
  const latest = await client.getBlock();
  const sampleNumber = latest.number > BLOCK_TIME_SAMPLE_SPAN ? latest.number - BLOCK_TIME_SAMPLE_SPAN : 0n;
  const sample = await client.getBlock({ blockNumber: sampleNumber });
  const spanBlocks = Number(latest.number - sample.number);
  return {
    latestNumber: latest.number,
    latestTimestamp: latest.timestamp,
    secondsPerBlock:
      spanBlocks > 0 ? Math.max(Number(latest.timestamp - sample.timestamp) / spanBlocks, MIN_SECONDS_PER_BLOCK) : 1,
  };
}

const blocksSpanning = (seconds: bigint, timeline: BlockTimeline, factor: number): bigint =>
  BigInt(Math.ceil((Number(seconds) / timeline.secondsPerBlock) * factor)) + 1n;

const blockBeforeLatest = (timeline: BlockTimeline, blocksBack: bigint): bigint =>
  blocksBack >= timeline.latestNumber ? 0n : timeline.latestNumber - blocksBack;

async function findBlockAtOrBefore(
  client: PublicClient,
  timeline: BlockTimeline,
  timestampSec: bigint,
): Promise<bigint> {
  if (timeline.latestTimestamp <= timestampSec) return timeline.latestNumber;

  let candidate = blockBeforeLatest(
    timeline,
    blocksSpanning(timeline.latestTimestamp - timestampSec, timeline, BLOCK_ESTIMATE_OVERSHOOT),
  );
  let candidateTimestamp: bigint | null = null;
  for (let step = 0; step < MAX_BLOCK_SEARCH_STEPS && candidate > 0n; step++) {
    const block = await client.getBlock({ blockNumber: candidate });
    if (block.timestamp <= timestampSec) {
      candidateTimestamp = block.timestamp;
      break;
    }
    const stepBack = blocksSpanning(block.timestamp - timestampSec, timeline, BLOCK_ESTIMATE_OVERSHOOT);
    candidate = stepBack >= candidate ? 0n : candidate - stepBack;
  }
  if (candidateTimestamp === null) return 0n;
  let settledTimestamp: bigint = candidateTimestamp;

  for (let step = 0; step < MAX_BLOCK_TIGHTEN_STEPS; step++) {
    const jump: bigint = blocksSpanning(timestampSec - settledTimestamp, timeline, BLOCK_ESTIMATE_UNDERSHOOT) - 1n;
    if (jump < MIN_BLOCK_TIGHTEN_JUMP) break;
    const probe: { timestamp: bigint } = await client.getBlock({ blockNumber: candidate + jump });
    if (probe.timestamp > timestampSec) break;
    candidate += jump;
    settledTimestamp = probe.timestamp;
  }
  return candidate;
}

async function findBlockAtOrAfter(
  client: PublicClient,
  timeline: BlockTimeline,
  timestampSec: bigint,
): Promise<bigint> {
  if (timeline.latestTimestamp <= timestampSec) return timeline.latestNumber;

  let candidate = blockBeforeLatest(
    timeline,
    blocksSpanning(timeline.latestTimestamp - timestampSec, timeline, BLOCK_ESTIMATE_UNDERSHOOT),
  );
  let candidateTimestamp: bigint | null = null;
  for (let step = 0; step < MAX_BLOCK_SEARCH_STEPS && candidate < timeline.latestNumber; step++) {
    const block = await client.getBlock({ blockNumber: candidate });
    if (block.timestamp >= timestampSec) {
      candidateTimestamp = block.timestamp;
      break;
    }
    candidate += blocksSpanning(timestampSec - block.timestamp, timeline, BLOCK_ESTIMATE_OVERSHOOT);
  }
  if (candidateTimestamp === null) return timeline.latestNumber;
  let settledTimestamp: bigint = candidateTimestamp;

  for (let step = 0; step < MAX_BLOCK_TIGHTEN_STEPS; step++) {
    const jump: bigint = blocksSpanning(settledTimestamp - timestampSec, timeline, BLOCK_ESTIMATE_UNDERSHOOT) - 1n;
    if (jump < MIN_BLOCK_TIGHTEN_JUMP || jump >= candidate) break;
    const probe: { timestamp: bigint } = await client.getBlock({ blockNumber: candidate - jump });
    if (probe.timestamp < timestampSec) break;
    candidate -= jump;
    settledTimestamp = probe.timestamp;
  }
  return candidate;
}

export async function resolveScanRange(
  client: PublicClient,
  resumeAfterBlock: bigint | null,
  scanFromSec: bigint,
  voteEndSec: bigint,
): Promise<ScanRange> {
  const timeline = await getBlockTimeline(client);
  const isComplete = timeline.latestTimestamp > voteEndSec;
  const [fromBlock, toBlock] = await Promise.all([
    resumeAfterBlock === null ? findBlockAtOrBefore(client, timeline, scanFromSec) : resumeAfterBlock + 1n,
    isComplete ? findBlockAtOrAfter(client, timeline, voteEndSec + 1n) : timeline.latestNumber,
  ]);
  return {
    fromBlock,
    toBlock,
    recordedCutoffSec: isComplete
      ? Number.POSITIVE_INFINITY
      : Number(timeline.latestTimestamp) + LATE_CAST_WRITE_WINDOW_SEC,
    isComplete,
  };
}
