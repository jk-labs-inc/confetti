import "server-only";

import { serverConfig } from "@config/wagmi";
import { executeWithTimeout } from "@helpers/timeout";
import { CONTESTS_FEATURE_COUNT } from "lib/contests/constants";
import { readContestDetails, resolveContestContract } from "lib/contests/reads";
import type { BaseContestData, ContestContract } from "lib/contests/types";
import { readContestPool } from "lib/rewards/contracts/reads";
import type { RewardTokensLookup } from "lib/rewards/types";
import { listContestRows } from "lib/supabase/contests";
import { getRewardTokenAddresses } from "lib/supabase/rewards";
import { isSupabaseServerConfigured } from "lib/supabase/server";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import type { FeaturedContestEntry, FeaturedPool, FeaturedSnapshot } from "./types";

const IS_BUILD = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
const KEEPS_LAST_GOOD_PAGE = process.env.NODE_ENV === "production" && !IS_BUILD;
const SNAPSHOT_BUDGET_MS = IS_BUILD ? 20_000 : 8_000;

type Deadline = <T>(work: Promise<T>) => Promise<T>;

const startDeadline = (startedAt: number): Deadline => {
  const deadlineAt = startedAt + SNAPSHOT_BUDGET_MS;
  return work => executeWithTimeout(Math.max(0, deadlineAt - Date.now()), work);
};

const lookupRewardTokens: RewardTokensLookup = (rewardsModule, chain) =>
  getRewardTokenAddresses({ rewardsModule, chain });

async function readPool(
  row: BaseContestData,
  contract: ContestContract,
  withinBudget: Deadline,
): Promise<FeaturedPool> {
  try {
    const pool = await withinBudget(readContestPool(serverConfig, contract, lookupRewardTokens));

    if (pool.status === "none") return { status: "none" };
    if (pool.status === "read" && pool.isComplete) return { status: "read", totals: pool.totals };
    return { status: "unread" };
  } catch (error) {
    console.warn(`[featured] pool unread for ${row.address}:`, error);
    return { status: "unread" };
  }
}

async function readEntry(row: BaseContestData, withinBudget: Deadline): Promise<FeaturedContestEntry> {
  let contract: ContestContract;
  try {
    contract = await withinBudget(resolveContestContract(row));
  } catch (error) {
    console.warn(`[featured] contest unread for ${row.address}:`, error);
    return { row, details: null, pool: { status: "unread" } };
  }

  const [details, pool] = await Promise.all([
    withinBudget(readContestDetails(serverConfig, contract)).catch((error: unknown) => {
      console.warn(`[featured] details unread for ${row.address}:`, error);
      return null;
    }),
    readPool(row, contract, withinBudget),
  ]);

  return { row, details, pool };
}

async function readFeaturedSnapshot(): Promise<FeaturedSnapshot> {
  const fetchedAt = Date.now();
  const withinBudget = startDeadline(fetchedAt);

  const { data: rows } = await withinBudget(
    listContestRows({ view: "featured", page: 0, perPage: CONTESTS_FEATURE_COUNT }),
  );
  const contests = await Promise.all(rows.map(row => readEntry(row, withinBudget)));

  if (contests.length > 0 && contests.every(entry => entry.details === null)) {
    throw new Error("no featured contest could be read from chain");
  }

  console.info("[featured] snapshot", {
    elapsedMs: Date.now() - fetchedAt,
    contests: contests.length,
    detailsUnread: contests.filter(entry => entry.details === null).length,
    poolsUnread: contests.filter(entry => entry.pool.status === "unread").length,
  });

  return { fetchedAt, contests };
}

export async function loadFeaturedSnapshot(): Promise<FeaturedSnapshot | null> {
  if (!isSupabaseServerConfigured()) return null;

  try {
    return await readFeaturedSnapshot();
  } catch (error) {
    if (KEEPS_LAST_GOOD_PAGE) throw error;
    console.warn("[featured] snapshot unavailable:", error);
    return null;
  }
}
