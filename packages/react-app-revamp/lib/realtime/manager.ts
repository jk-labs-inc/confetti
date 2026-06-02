import { supabase } from "@config/supabase";
import { isSupabaseConfigured } from "@helpers/database";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getTableConfig, RealtimeTableKey, TableEvent } from "./registry";
import { RealtimeChangePayload } from "./types";

// Singleton realtime transport: owns every Supabase channel keyed by `channelKey` and ref-counts
// subscribers so a StrictMode double-mount (or two watchers) share ONE channel, not duplicates.

type ChannelEntry = {
  channel: RealtimeChannel;
  subscribers: Map<symbol, (event: unknown) => void>;
  statusHandlers: Map<symbol, (status: string) => void>;
  pendingRemoval: boolean;
};

const channels = new Map<string, ChannelEntry>();

export interface SubscribeParams<TKey extends RealtimeTableKey> {
  channelKey: string;
  tableKey: TKey;
  filterValue: string;
  onEvent: (event: TableEvent<TKey>) => void;
  onStatus?: (status: string) => void;
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

function buildChannel<TKey extends RealtimeTableKey>(params: SubscribeParams<TKey>): RealtimeChannel {
  const { channelKey, tableKey, filterValue } = params;
  const config = getTableConfig(tableKey);
  const schema = config.schema ?? "public";
  const filter = `${config.filterColumn}=eq.${filterValue}`;

  let channel = supabase.channel(channelKey);

  for (const event of config.events) {
    channel = channel.on(
      "postgres_changes",
      { event, schema, table: config.table, filter },
      (payload: RealtimeChangePayload<unknown>) => dispatch(channelKey, config.parse, payload),
    );
  }

  channel.subscribe(status => dispatchStatus(channelKey, status));
  return channel;
}

function dispatch(
  channelKey: string,
  parse: (payload: RealtimeChangePayload<any>) => unknown,
  payload: RealtimeChangePayload<unknown>,
): void {
  const entry = channels.get(channelKey);
  if (!entry) return;

  let event: unknown;
  try {
    event = parse(payload);
  } catch (e) {
    console.error("[realtime] failed to parse payload", e);
    return;
  }
  if (event == null) return;

  entry.subscribers.forEach(handler => {
    try {
      handler(event);
    } catch (e) {
      console.error("[realtime] subscriber threw", e);
    }
  });
}

function dispatchStatus(channelKey: string, status: string): void {
  const entry = channels.get(channelKey);
  if (!entry) return;
  entry.statusHandlers.forEach(handler => {
    try {
      handler(status);
    } catch (e) {
      console.error("[realtime] status handler threw", e);
    }
  });
}

export function subscribe<TKey extends RealtimeTableKey>(params: SubscribeParams<TKey>): RealtimeSubscription {
  const { channelKey, onEvent, onStatus } = params;
  const token = Symbol(channelKey);

  if (!isSupabaseConfigured) {
    return { unsubscribe: () => {} };
  }

  let entry = channels.get(channelKey);
  if (!entry) {
    entry = {
      channel: buildChannel(params),
      subscribers: new Map(),
      statusHandlers: new Map(),
      pendingRemoval: false,
    };
    channels.set(channelKey, entry);
  } else {
    entry.pendingRemoval = false;
  }

  entry.subscribers.set(token, onEvent as (event: unknown) => void);
  if (onStatus) entry.statusHandlers.set(token, onStatus);

  return { unsubscribe: () => release(channelKey, token) };
}

export function release(channelKey: string, token: symbol): void {
  const entry = channels.get(channelKey);
  if (!entry) return;

  entry.subscribers.delete(token);
  entry.statusHandlers.delete(token);
  if (entry.subscribers.size > 0) return;

  // Defer teardown a microtask so a StrictMode re-subscribe can reuse the channel, not churn it.
  entry.pendingRemoval = true;
  queueMicrotask(() => {
    const current = channels.get(channelKey);
    if (current && current.pendingRemoval && current.subscribers.size === 0) {
      channels.delete(channelKey);
      void supabase.removeChannel(current.channel);
    }
  });
}

export function teardownAll(): void {
  channels.clear();
  if (!isSupabaseConfigured) return;
  void supabase.removeAllChannels();
}
