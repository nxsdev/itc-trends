import { createBrowserClient } from "@supabase/ssr"
import { envAtom } from "~/atoms/env-atom"

export function createClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase環境変数が設定されていません")
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
