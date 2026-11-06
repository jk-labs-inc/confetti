import {
  getUserActivity,
  insertParticipantRows,
  participantRowsInsertSchema,
  userActivityQuerySchema,
} from "lib/supabase/participants";
import { handleBody, handleQuery } from "lib/supabase/handlers";

export const GET = handleQuery(userActivityQuerySchema, getUserActivity);

export const POST = handleBody(participantRowsInsertSchema, insertParticipantRows);
