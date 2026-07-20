import { isSupabaseConfigured } from "@helpers/database";

interface SaveToAnalyticsContestParticipantsOptions {
  contest_address: string;
  user_address: `0x${string}` | undefined;
  network_name: string;
  created_at?: number;
  proposal_id?: string;
  proposal_name?: string;
  vote_amount?: number;
  deleted?: boolean;
  amount_sent?: number | null;
  percentage_to_rewards?: number | null;
}

const saveToAnalyticsContestParticipantsV3 = async (options: SaveToAnalyticsContestParticipantsOptions) => {
  if (isSupabaseConfigured) {
    try {
      const config = await import("@config/supabase");
      const supabase = config.supabase;

      const normalizedOptions = {
        ...options,
        contest_address: options.contest_address.toLowerCase(),
        user_address: options.user_address?.toLowerCase(),
      };

      const { error } = await supabase.from("analytics_contest_participants_v3").insert(normalizedOptions);
      if (error) {
        console.error("Error in saveToAnalyticsContestParticipantsV3:", error.message);
      }
    } catch (e) {
      console.error("Unexpected error in saveToAnalyticsContestParticipantsV3:", e);
    }
  }
};

export const addUserActionForAnalytics = async (options: SaveToAnalyticsContestParticipantsOptions) => {
  await saveToAnalyticsContestParticipantsV3(options);
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
  if (isSupabaseConfigured) {
    try {
      const config = await import("@config/supabase");
      const supabase = config.supabase;

      for (let proposal of proposals) {
        const { error } = await supabase.from("analytics_contest_participants_v3").insert([
          {
            user_address: userAddress?.toLowerCase(),
            contest_address: contestAddress.toLowerCase(),
            network_name: chainName,
            proposal_id: proposal.proposal_id,
            proposal_name: proposal.proposal_name,
            deleted: true,
          },
        ]);

        if (error) {
          console.error("Error inserting analytics for proposal:", proposal.proposal_id, "; Error:", error.message);
        }
      }
    } catch (e) {
      console.error("Unexpected error in saveUpdatedProposalsStatusToAnalyticsV3:", e);
    }
  }
};
