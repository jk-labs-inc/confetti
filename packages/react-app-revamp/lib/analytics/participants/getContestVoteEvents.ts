import { isSupabaseConfigured } from "@helpers/database";

export interface ContestVoteEvent {
  uuid: string;
  userAddress: string;
  proposalId: string;
  // Stored at write time since 07-2026; null for older rows, whose titles are read from the contract.
  proposalName: string | null;
  voteAmount: number;
  amountSent: number | null;
  createdAt: number;
}

export interface ContestVoteEventsPage {
  events: ContestVoteEvent[];
  rowCount: number;
  totalCount: number;
}

const VOTE_EVENT_COLUMNS = "uuid, user_address, proposal_id, proposal_name, vote_amount, amount_sent, created_at";
const EMPTY_PAGE: ContestVoteEventsPage = { events: [], rowCount: 0, totalCount: 0 };

interface VoteEventsPageOptions {
  withCount?: boolean;
  ascending?: boolean;
}

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

export async function getContestVoteEventsPage(
  contestAddress: string,
  chainName: string,
  offset: number,
  limit: number,
  { withCount = false, ascending = false }: VoteEventsPageOptions = {},
): Promise<ContestVoteEventsPage> {
  if (!isSupabaseConfigured || !contestAddress || !chainName) return EMPTY_PAGE;

  const { supabase } = await import("@config/supabase");
  const normalizedAddress = contestAddress.toLowerCase();
  const normalizedChainName = chainName.toLowerCase();

  const { data, error, count } = await supabase
    .from("analytics_contest_participants_v3")
    .select(VOTE_EVENT_COLUMNS, withCount ? { count: "exact" } : undefined)
    .eq("contest_address", normalizedAddress)
    // Same contract address recurs across chains (same deployer + nonce), so a contest is only
    // unique per (contest_address, network_name) — without this, another chain's votes leak in.
    .eq("network_name", normalizedChainName)
    .not("vote_amount", "is", null)
    .is("comment_id", null)
    .order("created_at", { ascending })
    .order("uuid", { ascending })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`getContestVoteEventsPage: ${error.message}`);

  const rows = (data ?? []) as ParticipantVoteRow[];
  const events: ContestVoteEvent[] = [];
  for (const row of rows) {
    const event = toContestVoteEvent(row);
    if (event) events.push(event);
  }

  return { events, rowCount: rows.length, totalCount: count ?? rows.length };
}

export async function getContestVoteEvents(
  contestAddress: string,
  chainName: string,
  offset: number,
  limit: number,
): Promise<ContestVoteEvent[]> {
  try {
    const page = await getContestVoteEventsPage(contestAddress, chainName, offset, limit);
    return page.events;
  } catch (e) {
    console.error("Unexpected error in getContestVoteEvents:", e);
    return [];
  }
}
