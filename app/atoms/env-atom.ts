import { atom } from "jotai"

type EnvType = {
  APP_URL: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export const envAtom = atom<EnvType | null>(null)
