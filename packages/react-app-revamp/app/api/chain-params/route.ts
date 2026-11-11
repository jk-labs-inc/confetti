import { chainParamsQuerySchema, getChainParams } from "lib/supabase/chainParams";
import { handleQuery } from "lib/supabase/handlers";

export const GET = handleQuery(chainParamsQuerySchema, getChainParams);
