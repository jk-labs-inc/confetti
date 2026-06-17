import { isSupabaseConfigured } from "@helpers/database";
import getPagination from "@helpers/getPagination";

export interface ContestVoteEvent {
  uuid: string;
  userAddress: string;
  proposalId: string;
  voteAmount: number;
  amountSent: number | null;
  createdAt: number;
}

// Supabase caps an unranged select at 1000 rows, so we page until a short page comes back.
const PAGE_SIZE = 1000;

interface ParticipantVoteRow {
  uuid: string;
  user_address: string | null;
  proposal_id: string | null;
  vote_amount: number | null;
  amount_sent: number | null;
  created_at: number | null;
}

export async function getContestVoteEvents(contestAddress: string): Promise<ContestVoteEvent[]> {
  if (!isSupabaseConfigured || !contestAddress) return [];

  try {
    const { supabase } = await import("@config/supabase");
    const normalizedAddress = contestAddress.toLowerCase();

    const events: ContestVoteEvent[] = [];

    for (let page = 0; ; page++) {
      const { from, to } = getPagination(page, PAGE_SIZE);
      const { data, error } = await supabase
        .from("analytics_contest_participants_v3")
        .select("uuid, user_address, proposal_id, vote_amount, amount_sent, created_at")
        .eq("contest_address", normalizedAddress)
        .not("vote_amount", "is", null)
        .is("comment_id", null)
        .order("created_at", { ascending: true })
        .range(from, to);

      if (error) {
        console.error("Error in getContestVoteEvents:", error.message);
        break;
      }

      const rows = (data ?? []) as ParticipantVoteRow[];

      for (const row of rows) {
        if (!row.user_address || !row.proposal_id || row.vote_amount == null || row.created_at == null) continue;
        events.push({
          uuid: row.uuid,
          userAddress: row.user_address,
          proposalId: row.proposal_id,
          voteAmount: row.vote_amount,
          amountSent: row.amount_sent,
          createdAt: row.created_at,
        });
      }

      if (rows.length < PAGE_SIZE) break;
    }

    return events;
  } catch (e) {
    console.error("Unexpected error in getContestVoteEvents:", e);
    return [];
  }
}
