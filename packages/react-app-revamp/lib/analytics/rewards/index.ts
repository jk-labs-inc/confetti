import { isSupabaseConfigured } from "@helpers/database";
import { postJson } from "@helpers/fetchJson";
import type { RewardAnalyticsInsert } from "lib/supabase/types";

export const updateRewardAnalytics = async (options: RewardAnalyticsInsert) => {
  if (!isSupabaseConfigured) return;

  await postJson("/api/rewards", options);
};
