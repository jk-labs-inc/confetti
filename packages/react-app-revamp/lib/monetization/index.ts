import { isSupabaseConfigured } from "@helpers/database";
import { getJson } from "@helpers/fetchJson";
import type { ChainParams, ChainParamsQuery } from "lib/supabase/types";

type ChargeDetails = {
  costToVote: number;
  isError: boolean;
};

const defaultChargeDetails: ChargeDetails = {
  costToVote: 0,
  isError: false,
};

export const fetchChainParams = (query: ChainParamsQuery) => getJson<ChainParams | null>("/api/chain-params", query);

export const fetchChargeDetails = async (chainName: string): Promise<ChargeDetails> => {
  if (!isSupabaseConfigured || !chainName) {
    return { ...defaultChargeDetails, isError: true };
  }

  try {
    const chainParams = await fetchChainParams({ chain: chainName });
    return {
      costToVote: chainParams?.defaultCostToVote ?? 0,
      isError: false,
    };
  } catch (error: any) {
    console.error("error fetching entry charge details:", error.message);
    return { ...defaultChargeDetails, isError: true };
  }
};
