import { AnalyticsContestParticipantRow, ContestParticipantEvent, RealtimeTableConfig } from "../types";

// Append-only table (votes, submissions, soft-deletes are all INSERTs), so we listen to INSERT only
// and classify each row in order: deleted → comment (ignored) → vote → otherwise submitted.
// `vote_amount` is a single vote's delta, NOT the cumulative tally — consumers re-read chain.
export const analyticsContestParticipantsConfig: RealtimeTableConfig<
  AnalyticsContestParticipantRow,
  ContestParticipantEvent
> = {
  table: "analytics_contest_participants_v3",
  schema: "public",
  events: ["INSERT"],
  filterColumn: "contest_address",
  normalizeFilterValue: value => value.toLowerCase(),
  parse: payload => {
    const row = payload.new;
    if (!row || !row.proposal_id || !row.contest_address) return null;

    const base = {
      contestAddress: row.contest_address,
      proposalId: row.proposal_id,
      userAddress: row.user_address,
    };

    if (row.deleted === true) {
      return { type: "entry.deleted", ...base };
    }
    if (row.comment_id != null) {
      return null;
    }
    if (row.vote_amount != null) {
      return { type: "vote.cast", ...base, voteAmount: row.vote_amount, createdAt: row.created_at };
    }
    return { type: "entry.submitted", ...base };
  },
};
