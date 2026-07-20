export type RealtimeChangeEventType = "INSERT" | "UPDATE" | "DELETE";

export interface RealtimeChangePayload<TRow> {
  eventType: RealtimeChangeEventType;
  schema: string;
  table: string;
  new: TRow;
  // Partial because its shape depends on the table's REPLICA IDENTITY.
  old: Partial<TRow>;
}

export interface RealtimeTableConfig<TRow, TEvent> {
  table: string;
  schema?: string;
  // postgres_changes allows one eq filter per listener and can't filter DELETE server-side, so
  // append-only tables should use ["INSERT"] and model deletions as soft-delete rows.
  events: RealtimeChangeEventType[];
  filterColumn: keyof TRow & string;
  normalizeFilterValue?: (value: string) => string;
  parse: (payload: RealtimeChangePayload<TRow>) => TEvent | null;
}

export interface AnalyticsContestParticipantRow {
  uuid: string;
  contest_address: string;
  user_address: string;
  network_name: string;
  proposal_id: string | null;
  proposal_name: string | null;
  vote_amount: number | null;
  created_at: number | null;
  deleted: boolean | null;
  amount_sent: number | null;
  comment_id: string | null;
  percentage_to_rewards: number | null;
}

export type ContestParticipantEvent =
  | {
      type: "vote.cast";
      uuid: string;
      contestAddress: string;
      proposalId: string;
      proposalName: string | null;
      userAddress: string;
      networkName: string | null;
      voteAmount: number | null;
      amountSent: number | null;
      createdAt: number | null;
    }
  | { type: "entry.deleted"; contestAddress: string; proposalId: string; userAddress: string }
  | { type: "entry.submitted"; contestAddress: string; proposalId: string; userAddress: string };
