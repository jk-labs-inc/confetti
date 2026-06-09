import { analyticsContestParticipantsConfig } from "./tables/analyticsContestParticipants";
import { RealtimeTableConfig } from "./types";

// To add a table: create `tables/<name>.ts` exporting a RealtimeTableConfig, then add one line here.
export const realtimeRegistry = {
  analytics_contest_participants_v3: analyticsContestParticipantsConfig,
} as const;

export type RealtimeTableKey = keyof typeof realtimeRegistry;

export type TableRow<TKey extends RealtimeTableKey> =
  (typeof realtimeRegistry)[TKey] extends RealtimeTableConfig<infer R, unknown> ? R : never;

export type TableEvent<TKey extends RealtimeTableKey> =
  (typeof realtimeRegistry)[TKey] extends RealtimeTableConfig<unknown, infer E> ? E : never;

export function getTableConfig<TKey extends RealtimeTableKey>(key: TKey): (typeof realtimeRegistry)[TKey] {
  const config = realtimeRegistry[key];
  if (!config) {
    throw new Error(`[realtime] no table config registered for "${String(key)}"`);
  }
  return config;
}
