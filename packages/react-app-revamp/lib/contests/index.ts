import { isSupabaseConfigured } from "@helpers/database";
import { getJson } from "@helpers/fetchJson";
import type { ContestExistsQuery, ContestListQuery, ContestRowsPage } from "lib/supabase/types";
import { SearchOptions } from "types/search";
import { ITEMS_PER_PAGE } from "./constants";
import { getContestContractData } from "./contracts";
import { BaseContestData, ContestsResponse, ProcessedContest } from "./types";
import { streamPromiseResults } from "./utils/streamItems";

const CONTESTS_API = "/api/contests";
const EMPTY_CONTESTS: ContestsResponse = { data: [], count: 0 };

const fetchContestRows = (query: ContestListQuery) => getJson<ContestRowsPage>(CONTESTS_API, query);

/**
 * Process contest data by fetching title and cancellation status from contracts
 */
async function processContestData(contest: BaseContestData): Promise<ProcessedContest> {
  const { title, isCanceled, prompt } = await getContestContractData(contest.address, contest.network_name);
  return {
    ...contest,
    title: title ?? "",
    isCanceled,
    prompt: prompt,
  };
}

/**
 * Process multiple contests in parallel
 */
async function processContestsData(contests: BaseContestData[]): Promise<ProcessedContest[]> {
  return Promise.all(contests.map(processContestData));
}

async function loadContests(query: ContestListQuery, { dropCanceled = false } = {}): Promise<ContestsResponse> {
  if (!isSupabaseConfigured) return EMPTY_CONTESTS;

  try {
    const { data, count } = await fetchContestRows(query);
    const processedData = await processContestsData(data);
    if (!dropCanceled) return { data: processedData, count };

    const activeData = processedData.filter(contest => !contest.isCanceled);
    return { data: activeData, count: count - (processedData.length - activeData.length) };
  } catch (e) {
    console.error(e);
    return EMPTY_CONTESTS;
  }
}

export async function searchContests(options: SearchOptions = {}, sortBy?: string): Promise<ContestsResponse> {
  const { searchString = "", pagination = {} } = options;
  const { currentPage = 1, itemsPerPage = ITEMS_PER_PAGE } = pagination;
  return loadContests({ view: "search", query: searchString, sortBy, page: currentPage, perPage: itemsPerPage });
}

export async function getUserContests(
  currentPage: number,
  itemsPerPage: number,
  profileAddress: string,
  sortBy?: string,
): Promise<ContestsResponse> {
  if (!profileAddress) return EMPTY_CONTESTS;
  return loadContests({ view: "user", author: profileAddress, sortBy, page: currentPage, perPage: itemsPerPage });
}

export async function* streamFeaturedContests(
  currentPage: number,
  itemsPerPage: number,
): AsyncGenerator<ProcessedContest, void, unknown> {
  if (!isSupabaseConfigured) return;

  let contests: BaseContestData[];
  try {
    ({ data: contests } = await fetchContestRows({ view: "featured", page: currentPage, perPage: itemsPerPage }));
  } catch (e) {
    console.error("Error fetching featured contests:", e);
    return;
  }

  yield* streamPromiseResults(
    contests.map(async contest => {
      try {
        return await processContestData(contest);
      } catch (err) {
        console.error(`Error processing contest ${contest.address}:`, err);
        return null;
      }
    }),
  );
}

export async function getLiveContests(
  currentPage: number,
  itemsPerPage: number,
  sortBy?: string,
): Promise<ContestsResponse> {
  return loadContests({ view: "live", sortBy, page: currentPage, perPage: itemsPerPage }, { dropCanceled: true });
}

export async function getPastContests(currentPage: number, itemsPerPage: number): Promise<ContestsResponse> {
  return loadContests({ view: "past", page: currentPage, perPage: itemsPerPage });
}

export async function getUpcomingContests(
  currentPage: number,
  itemsPerPage: number,
  sortBy?: string,
): Promise<ContestsResponse> {
  return loadContests({ view: "upcoming", sortBy, page: currentPage, perPage: itemsPerPage }, { dropCanceled: true });
}

export async function checkIfContestExists(address: string, networkName: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const query: ContestExistsQuery = { address, chain: networkName };
    return await getJson<boolean>(`${CONTESTS_API}/exists`, query);
  } catch (e) {
    console.error(e);
    return false;
  }
}
