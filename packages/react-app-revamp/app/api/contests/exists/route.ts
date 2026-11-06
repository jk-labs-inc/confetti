import { contestExists, contestExistsQuerySchema } from "lib/supabase/contests";
import { handleQuery } from "lib/supabase/handlers";

export const GET = handleQuery(contestExistsQuerySchema, contestExists);
