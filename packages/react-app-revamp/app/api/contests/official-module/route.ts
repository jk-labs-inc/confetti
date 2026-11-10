import { insertOfficialModuleContest, officialModuleInsertSchema } from "lib/supabase/contests";
import { handleBody } from "lib/supabase/handlers";

export const POST = handleBody(officialModuleInsertSchema, insertOfficialModuleContest);
