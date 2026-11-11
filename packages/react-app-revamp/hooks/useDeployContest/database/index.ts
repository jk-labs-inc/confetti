import { chains } from "@config/wagmi";
import { isSupabaseConfigured } from "@helpers/database";
import { postJson } from "@helpers/fetchJson";
import { fetchChainParams } from "lib/monetization";
import type { ContestInsert } from "lib/supabase/types";
import { ContestData } from "../helpers/contestData";

export async function getJkLabsSplitDestinationAddress(
  chainId: number,
  chargeType: { costToVote: number },
): Promise<string> {
  const chain = chains.find(c => c.id === chainId);

  if (!chain) {
    throw new Error(`Chain with id ${chainId} not found`);
  }

  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const chainParams = await fetchChainParams({ chain: chain.name });

  if (!chainParams?.jkLabsSplitDestination) {
    throw new Error(`No data found for chain ${chain.name}`);
  }

  return chainParams.jkLabsSplitDestination;
}

export async function indexContest(contestData: ContestData) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const contest: ContestInsert = {
    start_at: contestData.datetimeOpeningSubmissions.toISOString(),
    vote_start_at: contestData.datetimeOpeningVoting.toISOString(),
    end_at: contestData.datetimeClosingVoting.toISOString(),
    title: contestData.title,
    prompt: contestData.prompt,
    address: contestData.contractAddress,
    anyone_can_submit: contestData.anyoneCanSubmit,
    author_address: contestData.authorAddress,
    network_name: contestData.networkName,
    cost_to_vote: contestData.cost_to_vote,
    percentage_to_rewards: contestData.percentage_to_rewards,
    creator_split_enabled: contestData.creator_split_enabled,
  };

  await postJson("/api/contests", contest);
}
