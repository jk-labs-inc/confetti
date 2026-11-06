import {
  getRewardTokenAddresses,
  insertRewardAnalytics,
  rewardAnalyticsInsertSchema,
  rewardTokensQuerySchema,
} from "lib/supabase/rewards";
import { handleBody, handleQuery } from "lib/supabase/handlers";

export const GET = handleQuery(rewardTokensQuerySchema, getRewardTokenAddresses);

export const POST = handleBody(rewardAnalyticsInsertSchema, insertRewardAnalytics);
