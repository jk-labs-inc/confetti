import "server-only";
import { z } from "zod";
import { addressSchema, chainNameSchema } from "./schemas";
import { getSupabaseServer } from "./server";
import type { RewardAnalyticsInsert, RewardTokensQuery } from "./types";

const REWARDS_TABLE = "analytics_rewards_v3";
const NATIVE_TOKEN = "native";

export const rewardTokensQuerySchema = z.object({ rewardsModule: addressSchema, chain: chainNameSchema });

export const rewardAnalyticsInsertSchema = z.object({
  contest_address: addressSchema,
  rewards_module_address: addressSchema.or(z.literal("")),
  network_name: chainNameSchema,
  amount: z.number(),
  operation: z.enum(["deposit", "distribute", "withdraw"]),
  token_address: addressSchema.nullable(),
  created_at: z.number().int().nullish(),
});

export async function getRewardTokenAddresses({ rewardsModule, chain }: RewardTokensQuery): Promise<string[]> {
  const { data, error } = await getSupabaseServer()
    .from(REWARDS_TABLE)
    .select("token_address")
    .ilike("rewards_module_address", rewardsModule)
    .eq("network_name", chain.toLowerCase())
    .not("token_address", "is", null);

  if (error) throw new Error(error.message);

  const tokenAddresses = (data ?? []).map((row: { token_address: string }) => row.token_address);
  return Array.from(new Set(tokenAddresses.filter(address => address !== NATIVE_TOKEN)));
}

export async function insertRewardAnalytics({
  contest_address,
  rewards_module_address,
  network_name,
  amount,
  operation,
  token_address,
  created_at,
}: RewardAnalyticsInsert): Promise<void> {
  const { error } = await getSupabaseServer()
    .from(REWARDS_TABLE)
    .insert({
      contest_address: contest_address.toLowerCase(),
      rewards_module_address,
      network_name,
      token_address: token_address ? token_address.toLowerCase() : null,
      amount_paid_in: operation === "deposit" ? amount : null,
      amount_paid_out: operation === "distribute" ? amount : null,
      amount_withdrawn: operation === "withdraw" ? amount : null,
      created_at,
    });

  if (error) throw new Error(error.message);
}
