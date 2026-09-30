export { LEDGER_PAGE_SIZE } from "lib/analytics/participants/getContestVoteLedger";

export const LEDGER_GC_TIME = 5 * 60_000;
export const LEDGER_WRITE_COALESCE_MS = 250;
export const LEDGER_GAP_DEBOUNCE_MS = 4_000;
export const LEDGER_GAP_MIN_VOTES = 1;
export const LEDGER_GAP_RELATIVE_TOLERANCE = 1e-6;

export const contestVoteLedgerQueryKey = (address: string, chainName: string) =>
  ["contestVoteLedger", address.toLowerCase(), chainName.toLowerCase()] as const;
