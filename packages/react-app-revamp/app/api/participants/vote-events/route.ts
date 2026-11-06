import { getVoteEventsPage, voteEventsQuerySchema } from "lib/supabase/participants";
import { handleQuery } from "lib/supabase/handlers";

export const GET = handleQuery(voteEventsQuerySchema, getVoteEventsPage);
