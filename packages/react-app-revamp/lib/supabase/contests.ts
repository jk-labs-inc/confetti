import "server-only";
import getPagination from "@helpers/getPagination";
import type { BaseContestData } from "lib/contests/types";
import { z } from "zod";
import { addressSchema, chainNameSchema, pageSchema, perPageSchema, sortBySchema } from "./schemas";
import { getSupabaseServer } from "./server";
import type {
  ContestExistsQuery,
  ContestInsert,
  ContestListQuery,
  ContestRowsPage,
  OfficialModuleInsert,
} from "./types";

const CONTESTS_TABLE = "contests_v3";
const OFFICIAL_MODULES_TABLE = "contests_with_official_modules";
const CONTEST_COLUMNS =
  "created_at, start_at, end_at, address, author_address, network_name, vote_start_at, featured, anyone_can_submit";
const MAX_SEARCH_LENGTH = 200;

const pageFields = { page: pageSchema, perPage: perPageSchema };

export const contestListQuerySchema = z.discriminatedUnion("view", [
  z.object({
    view: z.literal("search"),
    query: z.string().min(1).max(MAX_SEARCH_LENGTH),
    sortBy: sortBySchema,
    ...pageFields,
  }),
  z.object({ view: z.literal("user"), author: addressSchema, sortBy: sortBySchema, ...pageFields }),
  z.object({ view: z.literal("featured"), ...pageFields }),
  z.object({ view: z.literal("live"), sortBy: sortBySchema, ...pageFields }),
  z.object({ view: z.literal("past"), ...pageFields }),
  z.object({ view: z.literal("upcoming"), sortBy: sortBySchema, ...pageFields }),
]);

export const contestExistsQuerySchema = z.object({ address: addressSchema, chain: chainNameSchema });

export const contestInsertSchema = z.object({
  start_at: z.iso.datetime(),
  vote_start_at: z.iso.datetime(),
  end_at: z.iso.datetime(),
  title: z.string(),
  prompt: z.string(),
  address: addressSchema,
  anyone_can_submit: z.number().int(),
  author_address: addressSchema,
  network_name: chainNameSchema,
  cost_to_vote: z.number(),
  percentage_to_rewards: z.number(),
  creator_split_enabled: z.number().int().optional(),
});

export const officialModuleInsertSchema = z.object({ address: addressSchema, network_name: chainNameSchema });

function sortContests(query: any, sortBy: string) {
  const currentTime = new Date().toISOString();

  switch (sortBy) {
    case "newest":
      return query.order("created_at", { ascending: false });
    case "oldest":
      return query.order("created_at", { ascending: true });
    case "closest_deadline":
      return query.order("end_at", { ascending: true });
    case "submissions_open":
      return query.lte("start_at", currentTime).gt("vote_start_at", currentTime);
    case "voting_open":
      return query.lte("vote_start_at", currentTime).gte("end_at", currentTime);
    default:
      return query;
  }
}

const selectContests = () => getSupabaseServer().from(CONTESTS_TABLE).select(CONTEST_COLUMNS, { count: "exact" });

async function readPage(
  query: PromiseLike<{ data: unknown; count: number | null; error: { message: string } | null }>,
) {
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as BaseContestData[];
  return { data: rows, count: count ?? rows.length };
}

async function getUserContestRows(author: string, from: number, to: number, sortBy?: string) {
  const runQuery = (matchCaseInsensitive: boolean) => {
    let query = selectContests();
    query = matchCaseInsensitive ? query.ilike("author_address", author) : query.eq("author_address", author);
    query = query.order("created_at", { ascending: false });
    if (sortBy) query = sortContests(query, sortBy);
    return readPage(query.range(from, to));
  };

  const exactMatch = await runQuery(false);
  return exactMatch.data.length > 0 ? exactMatch : runQuery(true);
}

export async function listContestRows(query: ContestListQuery): Promise<ContestRowsPage> {
  const { from, to } = getPagination(query.page, query.perPage);
  const now = new Date().toISOString();

  switch (query.view) {
    case "search": {
      let request = selectContests().textSearch("title", query.query, { type: "websearch", config: "english" });
      if (query.sortBy) request = sortContests(request, query.sortBy);
      return readPage(request.range(from, to).order("created_at", { ascending: false }));
    }
    case "user":
      return getUserContestRows(query.author, from, to, query.sortBy);
    case "featured":
      return readPage(
        getSupabaseServer().from(CONTESTS_TABLE).select(CONTEST_COLUMNS).range(from, to).is("featured", true),
      );
    case "live": {
      let request = selectContests().lte("start_at", now).gte("end_at", now);
      if (query.sortBy) request = sortContests(request, query.sortBy);
      return readPage(request.range(from, to));
    }
    case "past":
      return readPage(selectContests().lt("end_at", now).order("end_at", { ascending: false }).range(from, to));
    case "upcoming": {
      let request = selectContests().gt("start_at", now);
      request = query.sortBy ? sortContests(request, query.sortBy) : request.order("start_at", { ascending: false });
      return readPage(request.range(from, to));
    }
    default: {
      const _exhaustive: never = query;
      return _exhaustive;
    }
  }
}

export async function contestExists({ address, chain }: ContestExistsQuery): Promise<boolean> {
  const findContest = async (candidate: string) => {
    const { data, error } = await getSupabaseServer()
      .from(CONTESTS_TABLE)
      .select("address")
      .eq("address", candidate)
      .or("disabled.eq.false,disabled.is.null")
      .eq("network_name", chain);
    if (error) throw new Error(error.message);
    return (data ?? []).length > 0;
  };

  return (await findContest(address.toLowerCase())) || findContest(address);
}

export async function insertContest(contest: ContestInsert): Promise<void> {
  const { error } = await getSupabaseServer()
    .from(CONTESTS_TABLE)
    .insert([{ ...contest, created_at: new Date().toISOString(), featured: false }]);
  if (error) throw new Error(error.message);
}

export async function insertOfficialModuleContest({ address, network_name }: OfficialModuleInsert): Promise<void> {
  const { error } = await getSupabaseServer()
    .from(OFFICIAL_MODULES_TABLE)
    .insert({ network_name: network_name.toLowerCase(), address, type: "voters" });
  if (error) throw new Error(error.message);
}
