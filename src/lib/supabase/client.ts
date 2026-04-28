import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

type DB = Omit<Database, "__InternalSupabase">;

export function createClient() {
  return createBrowserClient<DB>(env.supabaseUrl, env.supabaseAnonKey);
}
