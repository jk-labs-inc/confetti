import type { BaseContestData } from "lib/contests/types";
import type { Submission } from "lib/user/types";
import type { z } from "zod";
import type { chainParamsQuerySchema } from "./chainParams";
import type {
  contestExistsQuerySchema,
  contestInsertSchema,
  contestListQuerySchema,
  officialModuleInsertSchema,
} from "./contests";
import type { participantRowsInsertSchema, userActivityQuerySchema, voteEventsQuerySchema } from "./participants";
import type { rewardAnalyticsInsertSchema, rewardTokensQuerySchema } from "./rewards";
import type { signupCheckSchema, signupInsertSchema, signupKindSchema } from "./signups";

export type SignupKind = z.output<typeof signupKindSchema>;

export type ContestListQuery = z.output<typeof contestListQuerySchema>;
export type ContestExistsQuery = z.output<typeof contestExistsQuerySchema>;
export type ContestInsert = z.output<typeof contestInsertSchema>;
export type OfficialModuleInsert = z.output<typeof officialModuleInsertSchema>;
export type UserActivityQuery = z.output<typeof userActivityQuerySchema>;
export type VoteEventsQuery = z.output<typeof voteEventsQuerySchema>;
export type ParticipantRowsInsert = z.output<typeof participantRowsInsertSchema>;
export type RewardTokensQuery = z.output<typeof rewardTokensQuerySchema>;
export type RewardAnalyticsInsert = z.output<typeof rewardAnalyticsInsertSchema>;
export type ChainParamsQuery = z.output<typeof chainParamsQuerySchema>;
export type SignupInsert = z.output<typeof signupInsertSchema>;
export type SignupCheck = z.output<typeof signupCheckSchema>;

export interface ContestRowsPage {
  data: BaseContestData[];
  count: number;
}

export interface UserActivityPage {
  data: Submission[];
  count: number;
}

export interface ChainParams {
  defaultCostToVote: number | null;
  jkLabsSplitDestination: string | null;
}

export interface SignupResult {
  replacesExisting: boolean | null;
}

export interface SignupCheckResult {
  exists: boolean;
}
