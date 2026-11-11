import { isSupabaseConfigured } from "@helpers/database";
import { postJson } from "@helpers/fetchJson";
import type { ParticipantRowsInsert } from "lib/supabase/types";

type SaveToAnalyticsContestParticipantsOptions = ParticipantRowsInsert["rows"][number];

const saveParticipantRows = async (rows: ParticipantRowsInsert["rows"]) => {
  const body: ParticipantRowsInsert = { rows };
  await postJson("/api/participants", body);
};

export const addUserActionForAnalytics = async (options: SaveToAnalyticsContestParticipantsOptions) => {
  if (!isSupabaseConfigured) return;

  try {
    await saveParticipantRows([options]);
  } catch (e) {
    console.error("Error in addUserActionForAnalytics:", e);
  }
};

export interface DeletedProposalAnalytics {
  proposal_id: string;
  proposal_name?: string;
}

export const saveUpdatedProposalsStatusToAnalyticsV3 = async (
  userAddress: string,
  contestAddress: string,
  chainName: string,
  proposals: DeletedProposalAnalytics[],
) => {
  if (!isSupabaseConfigured || proposals.length === 0) return;

  const createdAt = Math.floor(Date.now() / 1000);
  try {
    await saveParticipantRows(
      proposals.map(proposal => ({
        user_address: userAddress,
        contest_address: contestAddress,
        network_name: chainName,
        proposal_id: proposal.proposal_id,
        proposal_name: proposal.proposal_name,
        created_at: createdAt,
        deleted: true,
      })),
    );
  } catch (e) {
    console.error("Unexpected error in saveUpdatedProposalsStatusToAnalyticsV3:", e);
  }
};
