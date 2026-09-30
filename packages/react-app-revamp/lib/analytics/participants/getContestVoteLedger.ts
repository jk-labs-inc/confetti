import { ContestVoteEvent, ContestVoteEventsPage, getContestVoteEventsPage } from "./getContestVoteEvents";

export const LEDGER_PAGE_SIZE = 1000;
export const LEDGER_MAX_PAGES = 10;

export interface ContestVoteLedgerData {
  casts: ContestVoteEvent[];
  isTruncated: boolean;
}

export const compareCastsAscending = (a: ContestVoteEvent, b: ContestVoteEvent): number =>
  a.createdAt - b.createdAt || a.uuid.localeCompare(b.uuid);

const dedupeAndSort = (pages: ContestVoteEventsPage[]): ContestVoteEvent[] => {
  const byUuid = new Map<string, ContestVoteEvent>();
  for (const page of pages) {
    for (const event of page.events) byUuid.set(event.uuid, event);
  }
  return Array.from(byUuid.values()).sort(compareCastsAscending);
};

const tailPageOffsets = (totalCount: number, pageSize: number): number[] =>
  Array.from({ length: LEDGER_MAX_PAGES }, (_, index) => totalCount - (LEDGER_MAX_PAGES - index) * pageSize);

const followingPageOffsets = (pageCount: number, pageSize: number): number[] =>
  Array.from({ length: pageCount - 1 }, (_, index) => (index + 1) * pageSize);

export async function getContestVoteLedger(contestAddress: string, chainName: string): Promise<ContestVoteLedgerData> {
  const firstPage = await getContestVoteEventsPage(contestAddress, chainName, 0, LEDGER_PAGE_SIZE, {
    withCount: true,
    ascending: true,
  });
  const servedPageSize = firstPage.rowCount;
  if (servedPageSize === 0 || firstPage.totalCount <= servedPageSize) {
    return { casts: dedupeAndSort([firstPage]), isTruncated: false };
  }

  const pagesNeeded = Math.ceil(firstPage.totalCount / servedPageSize);
  const isTruncated = pagesNeeded > LEDGER_MAX_PAGES;
  const offsets = isTruncated
    ? tailPageOffsets(firstPage.totalCount, servedPageSize)
    : followingPageOffsets(pagesNeeded, servedPageSize);
  const pages = await Promise.all(
    offsets.map(offset =>
      getContestVoteEventsPage(contestAddress, chainName, offset, servedPageSize, { ascending: true }),
    ),
  );

  return { casts: dedupeAndSort(isTruncated ? pages : [firstPage, ...pages]), isTruncated };
}
