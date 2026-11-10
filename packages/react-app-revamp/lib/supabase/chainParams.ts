import "server-only";
import { z } from "zod";
import { chainNameSchema } from "./schemas";
import { getSupabaseServer } from "./server";
import type { ChainParams, ChainParamsQuery } from "./types";

export const chainParamsQuerySchema = z.object({ chain: chainNameSchema });

export async function getChainParams({ chain }: ChainParamsQuery): Promise<ChainParams | null> {
  const { data, error } = await getSupabaseServer()
    .from("chain_params")
    .select("default_cost_to_vote, jk_labs_split_destination")
    .eq("network_name", chain.toLowerCase())
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    defaultCostToVote: data.default_cost_to_vote ?? null,
    jkLabsSplitDestination: data.jk_labs_split_destination ?? null,
  };
}
