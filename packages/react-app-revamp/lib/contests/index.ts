import { isSupabaseConfigured } from "@helpers/database";
import getPagination from "@helpers/getPagination";
import { SearchOptions } from "types/search";
import { CONTEST_COLUMNS, ITEMS_PER_PAGE } from "./constants";
import { getContestContractData } from "./contracts";
import { BaseContestData, ContestsResponse, ProcessedContest } from "./types";
import { sortContests } from "./utils/sortContests";
import { streamProcessItems } from "./utils/streamItems";

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

// Search for contests based on the search options provided, table is contests by default and column is title by default
export async function searchContests(options: SearchOptions = {}, sortBy?: string): Promise<ContestsResponse> {
  const {
    searchColumn = "title",
    searchString = "",
    pagination = { currentPage: 1, itemsPerPage: ITEMS_PER_PAGE },
    sorting = { orderBy: "created_at", ascending: false },
    table = "contests_v3",
    language = "english",
  } = options;

  const { currentPage = 1, itemsPerPage = ITEMS_PER_PAGE } = pagination;
  const { orderBy = "created_at", ascending = false } = sorting;

  if (isSupabaseConfigured) {
    const config = await import("@config/supabase");
    const supabase = config.supabase;
    const { from, to } = getPagination(currentPage, itemsPerPage);
    try {
      let query = supabase
        .from(table)
        .select(CONTEST_COLUMNS, {
          count: "exact",
        })
        .textSearch(searchColumn, `${searchString}`, {
          type: "websearch",
          config: language,
        });

      if (sortBy) {
        query = sortContests(query, sortBy);
      }

      query = query.range(from, to).order(orderBy, { ascending });

      const result = await query;

      const { data, count, error } = result;
      if (error) {
        throw new Error(error.message);
      }

      const processedData = await processContestsData(data as BaseContestData[]);

      return { data: processedData, count: count ?? 0 };
    } catch (e) {
      console.error(e);
      return { data: [], count: 0 };
    }
  }
  return { data: [], count: 0 };
}

export async function getUserContests(
  currentPage: number,
  itemsPerPage: number,
  profileAddress: string,
  sortBy?: string,
): Promise<ContestsResponse> {
  if (isSupabaseConfigured && profileAddress) {
    const config = await import("@config/supabase");
    const supabase = config.supabase;
    const { from, to } = getPagination(currentPage, itemsPerPage);

    try {
      const executeQuery = async (useIlike: boolean) => {
        let query = supabase.from("contests_v3").select(CONTEST_COLUMNS, {
          count: "exact",
        });

        if (useIlike) {
          query = query.ilike("author_address", profileAddress);
        } else {
          query = query.eq("author_address", profileAddress);
        }
        query = query.order("created_at", { ascending: false });

        if (sortBy) {
          query = sortContests(query, sortBy);
        }
        return query.range(from, to);
      };

      // first attempt with eq
      let result = await executeQuery(false);

      // if no results, it could be that address is lowercase, try with ilike
      if (result.data?.length === 0) {
        result = await executeQuery(true);
      }

      const { data, count, error } = result;
      if (error) {
        throw new Error(error.message);
      }

      const processedData = await processContestsData(data as BaseContestData[]);

      return { data: processedData, count: count ?? 0 };
    } catch (e) {
      console.error(e);
      return { data: [], count: 0 };
    }
  }
  return { data: [], count: 0 };
}

export async function* streamFeaturedContests(
  currentPage: number,
  itemsPerPage: number,
): AsyncGenerator<ProcessedContest, void, unknown> {
  const contestStream = streamProcessItems<BaseContestData, ProcessedContest>(
    "contests_v3",
    query => query.is("featured", true),
    async contest => {
      try {
        return await processContestData(contest);
      } catch (err) {
        console.error(`Error processing contest ${contest.address}:`, err);
        return null;
      }
    },
    { currentPage, itemsPerPage },
    CONTEST_COLUMNS,
  );

  for await (const contest of contestStream) {
    yield contest;
  }
}

export async function getLiveContests(
  currentPage: number,
  itemsPerPage: number,
  sortBy?: string,
): Promise<ContestsResponse> {
  if (isSupabaseConfigured) {
    const config = await import("@config/supabase");
    const supabase = config.supabase;
    const { from, to } = getPagination(currentPage, itemsPerPage);
    try {
      let query = supabase
        .from("contests_v3")
        .select(CONTEST_COLUMNS, {
          count: "exact",
        })
        .lte("start_at", new Date().toISOString())
        .gte("end_at", new Date().toISOString());

      if (sortBy) {
        query = sortContests(query, sortBy);
      }

      query = query.range(from, to);

      const result = await query;

      const { data, count, error } = result;
      if (error) {
        throw new Error(error.message);
      }

      const processedData = await processContestsData(data as BaseContestData[]);

      return { data: processedData, count: count ?? 0 };
    } catch (e) {
      console.error(e);
      return { data: [], count: 0 };
    }
  }
  return { data: [], count: 0 };
}

export async function getPastContests(currentPage: number, itemsPerPage: number): Promise<ContestsResponse> {
  if (isSupabaseConfigured) {
    const config = await import("@config/supabase");
    const supabase = config.supabase;
    const { from, to } = getPagination(currentPage, itemsPerPage);
    try {
      const result = await supabase
        .from("contests_v3")
        .select(CONTEST_COLUMNS, {
          count: "exact",
        })
        .lt("end_at", new Date().toISOString())
        .order("end_at", { ascending: false })
        .range(from, to);
      const { data, count, error } = result;
      if (error) {
        throw new Error(error.message);
      }

      const processedData = await processContestsData(data as BaseContestData[]);

      return { data: processedData, count: count ?? 0 };
    } catch (e) {
      console.error(e);
    }
    return { data: [], count: 0 };
  }
  return { data: [], count: 0 };
}

export async function getUpcomingContests(
  currentPage: number,
  itemsPerPage: number,
  sortBy?: string,
): Promise<ContestsResponse> {
  if (isSupabaseConfigured) {
    const config = await import("@config/supabase");
    const supabase = config.supabase;
    const { from, to } = getPagination(currentPage, itemsPerPage);

    try {
      let query = supabase
        .from("contests_v3")
        .select(CONTEST_COLUMNS, {
          count: "exact",
        })
        .gt("start_at", new Date().toISOString());

      if (sortBy) {
        query = sortContests(query, sortBy);
      } else {
        query = query.order("start_at", { ascending: false });
      }

      query = query.range(from, to);

      const result = await query;
      const { data, count, error } = result;
      if (error) {
        throw new Error(error.message);
      }

      const processedData = await processContestsData(data as BaseContestData[]);

      return { data: processedData, count: count ?? 0 };
    } catch (e) {
      console.error(e);
      return { data: [], count: 0 };
    }
  }
  return { data: [], count: 0 };
}

export async function checkIfContestExists(address: string, networkName: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const config = await import("@config/supabase");
    const supabase = config.supabase;
    try {
      let { data, error } = await supabase
        .from("contests_v3")
        .select("address")
        .eq("address", address.toLowerCase())
        .or("disabled.eq.false,disabled.is.null")
        .eq("network_name", networkName);

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.length > 0) {
        return true;
      }

      console.log("in here");

      ({ data, error } = await supabase
        .from("contests_v3")
        .select("address")
        .eq("address", address)
        .or("disabled.eq.false,disabled.is.null")
        .eq("network_name", networkName));

      if (error) {
        throw new Error(error.message);
      }

      return data ? data.length > 0 : false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  return false;
}
