import { isSupabaseConfigured } from "@helpers/database";
import { getJson } from "@helpers/fetchJson";
import type { VoteEventsQuery } from "lib/supabase/types";

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

const EMPTY_PAGE: ContestVoteEventsPage = { events: [], rowCount: 0, totalCount: 0 };

interface VoteEventsPageOptions {
  withCount?: boolean;
  ascending?: boolean;
}

export async function getContestVoteEventsPage(
  contestAddress: string,
  chainName: string,
  offset: number,
  limit: number,
  { withCount = false, ascending = false }: VoteEventsPageOptions = {},
): Promise<ContestVoteEventsPage> {
  if (!isSupabaseConfigured || !contestAddress || !chainName) return EMPTY_PAGE;

  const query: VoteEventsQuery = { contest: contestAddress, chain: chainName, offset, limit, withCount, ascending };
  return getJson<ContestVoteEventsPage>("/api/participants/vote-events", query);
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
