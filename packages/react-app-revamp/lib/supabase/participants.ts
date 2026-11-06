import "server-only";
import getPagination from "@helpers/getPagination";
import type { ContestVoteEvent, ContestVoteEventsPage } from "lib/analytics/participants/getContestVoteEvents";
import type { Submission } from "lib/user/types";
import { z } from "zod";
import { addressSchema, chainNameSchema, pageSchema, perPageSchema, rowOffsetSchema } from "./schemas";
import { getSupabaseServer } from "./server";
import type { ParticipantRowsInsert, UserActivityPage, UserActivityQuery, VoteEventsQuery } from "./types";

const PARTICIPANTS_TABLE = "analytics_contest_participants_v3";
const ENTRY_COLUMNS = "network_name, contest_address, proposal_id, proposal_name, created_at";
const VOTE_COLUMNS = "network_name, contest_address, proposal_id, proposal_name, created_at, vote_amount";
const VOTE_EVENT_COLUMNS = "uuid, user_address, proposal_id, proposal_name, vote_amount, amount_sent, created_at";
const MAX_VOTE_EVENTS_PER_PAGE = 1_000;
const MAX_ROWS_PER_INSERT = 1_000;
const MAX_PROPOSAL_ID_LENGTH = 100;

export const userActivityQuerySchema = z.object({
  user: addressSchema,
  kind: z.enum(["entries", "votes"]),
  page: pageSchema,
  perPage: perPageSchema,
});

export const voteEventsQuerySchema = z.object({
  contest: addressSchema,
  chain: chainNameSchema,
  offset: rowOffsetSchema,
  limit: z.coerce.number().int().min(1).max(MAX_VOTE_EVENTS_PER_PAGE),
  withCount: z.stringbool().optional(),
  ascending: z.stringbool().optional(),
});

const participantRowSchema = z.object({
  contest_address: addressSchema,
  user_address: addressSchema.nullish(),
  network_name: chainNameSchema,
  created_at: z.number().int().nullish(),
  proposal_id: z.string().max(MAX_PROPOSAL_ID_LENGTH).nullish(),
  proposal_name: z.string().nullish(),
  vote_amount: z.number().nullish(),
  deleted: z.boolean().nullish(),
  amount_sent: z.number().nullish(),
  percentage_to_rewards: z.number().nullish(),
});

export const participantRowsInsertSchema = z.object({
  rows: z.array(participantRowSchema).min(1).max(MAX_ROWS_PER_INSERT),
});

interface ParticipantVoteRow {
  uuid: string;
  user_address: string | null;
  proposal_id: string | null;
  proposal_name: string | null;
  vote_amount: number | null;
  amount_sent: number | null;
  created_at: number | null;
}

const toContestVoteEvent = (row: ParticipantVoteRow): ContestVoteEvent | null => {
  if (!row.user_address || !row.proposal_id || row.vote_amount == null || row.created_at == null) return null;
  return {
    uuid: row.uuid,
    userAddress: row.user_address,
    proposalId: row.proposal_id,
    proposalName: row.proposal_name,
    voteAmount: row.vote_amount,
    amountSent: row.amount_sent,
    createdAt: row.created_at,
  };
};

export async function getUserActivity({ user, kind, page, perPage }: UserActivityQuery): Promise<UserActivityPage> {
  const { from, to } = getPagination(page, perPage);
  const selectUserRows = (columns: string, options?: { count: "exact"; head: true }) => {
    const userRows = getSupabaseServer().from(PARTICIPANTS_TABLE).select(columns, options).ilike("user_address", user);
    return kind === "entries"
      ? userRows.is("vote_amount", null).is("comment_id", null)
      : userRows.not("vote_amount", "is", null);
  };

  const [dataResult, countResult] = await Promise.all([
    selectUserRows(kind === "entries" ? ENTRY_COLUMNS : VOTE_COLUMNS)
      .order("created_at", { ascending: false, nullsFirst: false })
      .order("uuid", { ascending: false })
      .range(from, to)
      .overrideTypes<Submission[], { merge: false }>(),
    selectUserRows("*", { count: "exact", head: true }),
  ]);

  if (dataResult.error) throw new Error(dataResult.error.message);
  if (countResult.error) throw new Error(countResult.error.message);

  return { data: dataResult.data ?? [], count: countResult.count ?? 0 };
}

export async function getVoteEventsPage({
  contest,
  chain,
  offset,
  limit,
  withCount = false,
  ascending = false,
}: VoteEventsQuery): Promise<ContestVoteEventsPage> {
  const { data, error, count } = await getSupabaseServer()
    .from(PARTICIPANTS_TABLE)
    .select(VOTE_EVENT_COLUMNS, withCount ? { count: "exact" } : undefined)
    .eq("contest_address", contest.toLowerCase())
    .eq("network_name", chain.toLowerCase())
    .not("vote_amount", "is", null)
    .is("comment_id", null)
    .order("created_at", { ascending })
    .order("uuid", { ascending })
    .range(offset, offset + limit - 1)
    .overrideTypes<ParticipantVoteRow[], { merge: false }>();

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const events: ContestVoteEvent[] = [];
  for (const row of rows) {
    const event = toContestVoteEvent(row);
    if (event) events.push(event);
  }

  return { events, rowCount: rows.length, totalCount: count ?? rows.length };
}

export async function insertParticipantRows({ rows }: ParticipantRowsInsert): Promise<void> {
  const normalizedRows = rows.map(row => ({
    ...row,
    contest_address: row.contest_address.toLowerCase(),
    user_address: row.user_address?.toLowerCase(),
  }));

  const { error } = await getSupabaseServer().from(PARTICIPANTS_TABLE).insert(normalizedRows);
  if (error) throw new Error(error.message);
}
