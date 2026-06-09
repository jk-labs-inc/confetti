import { isSupabaseConfigured } from "@helpers/database";
import { createClient } from "@supabase/supabase-js";

let supabaseUrl = "000000000000000000000000000000000000.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000.0000000000000000000000000000000000000000000";
let supabaseAnonKey = "000000000000000000000000000000000000.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000.0000000000000000000000000000000000000000000";

if (isSupabaseConfigured) {
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
}

// worker: true runs the realtime heartbeat in a Web Worker so it keeps firing in backgrounded tabs
// (browsers throttle main-thread timers), preventing silent WebSocket drops + reconnect storms on
// refocus. The worker is only instantiated when a channel actually connects, so SSR is unaffected.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { worker: true },
});
