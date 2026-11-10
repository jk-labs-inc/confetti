import { contestInsertSchema, contestListQuerySchema, insertContest, listContestRows } from "lib/supabase/contests";
import { handleBody, handleQuery } from "lib/supabase/handlers";

export const GET = handleQuery(contestListQuerySchema, listContestRows);

export const POST = handleBody(contestInsertSchema, insertContest);
