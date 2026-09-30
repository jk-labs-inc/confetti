export const CHAIN_VOTE_CASTS_GC_TIME = 10 * 60_000;
export const CHAIN_VOTE_CASTS_SCAN_RETRIES = 2;
export const LATE_CAST_WRITE_WINDOW_SEC = 300;
export const CAST_MATCH_MIN_VOTES = 1;
export const CAST_MATCH_RELATIVE_TOLERANCE = 0.001;
export const MIN_LOG_CHUNK_BLOCKS = 1_000n;
export const LOG_QUERY_MAX_BLOCK_SPAN = 10_000n;
export const LOG_RANGE_LIMIT_RPC_CODE = -32614;
export const LOG_RANGE_LIMIT_HTTP_STATUS = 413;
export const LOG_QUERY_CONCURRENCY = 4;
export const BLOCK_TIME_SAMPLE_SPAN = 10_000n;
export const BLOCK_ESTIMATE_OVERSHOOT = 1.05;
export const BLOCK_ESTIMATE_UNDERSHOOT = 0.95;
export const MIN_SECONDS_PER_BLOCK = 1e-3;
export const MAX_BLOCK_SEARCH_STEPS = 8;
export const MAX_BLOCK_TIGHTEN_STEPS = 2;
export const MIN_BLOCK_TIGHTEN_JUMP = 1_000n;
export const CAST_DETAILS_CONCURRENCY = 8;
export const CHAIN_CAST_UUID_PREFIX = "chain";

export const chainVoteCastsQueryKey = (contestAddress: string, chainId: number) =>
  ["chainVoteCasts", contestAddress.toLowerCase(), chainId] as const;
