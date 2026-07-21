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

export const INITIAL_VOTE_PAGE_SIZE = 20;
export const MORE_VOTE_PAGE_SIZE = 100;

interface ParticipantVoteRow {
  uuid: string;
  user_address: string | null;
  proposal_id: string | null;
  proposal_name: string | null;
  vote_amount: number | null;
  amount_sent: number | null;
  created_at: number | null;
}

export async function getContestVoteEvents(
  contestAddress: string,
  chainName: string,
  offset = 0,
  limit = INITIAL_VOTE_PAGE_SIZE,
): Promise<ContestVoteEvent[]> {
  if (!isSupabaseConfigured || !contestAddress || !chainName) return [];

  try {
    const { supabase } = await import("@config/supabase");
    const normalizedAddress = contestAddress.toLowerCase();
    const normalizedChainName = chainName.toLowerCase();

    const { data, error } = await supabase
      .from("analytics_contest_participants_v3")
      .select("uuid, user_address, proposal_id, proposal_name, vote_amount, amount_sent, created_at")
      .eq("contest_address", normalizedAddress)
      // Same contract address recurs across chains (same deployer + nonce), so a contest is only
      // unique per (contest_address, network_name) — without this, another chain's votes leak in.
      .eq("network_name", normalizedChainName)
      .not("vote_amount", "is", null)
      .is("comment_id", null)
      .order("created_at", { ascending: false })
      .order("uuid", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error in getContestVoteEvents:", error.message);
      return [];
    }

    const rows = (data ?? []) as ParticipantVoteRow[];
    const events: ContestVoteEvent[] = [];

    for (const row of rows) {
      if (!row.user_address || !row.proposal_id || row.vote_amount == null || row.created_at == null) continue;
      events.push({
        uuid: row.uuid,
        userAddress: row.user_address,
        proposalId: row.proposal_id,
        proposalName: row.proposal_name,
        voteAmount: row.vote_amount,
        amountSent: row.amount_sent,
        createdAt: row.created_at,
      });
    }

    return events;
  } catch (e) {
    console.error("Unexpected error in getContestVoteEvents:", e);
    return [];
  }
}
