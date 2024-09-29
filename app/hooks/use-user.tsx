import type { User } from "@supabase/supabase-js"
import { atom, useAtomValue, useSetAtom } from "jotai"
import { userAtom } from "~/atoms/user-atom"

export function useUser() {
  return useAtomValue(userAtom)
}

export function useSetUser() {
  return useSetAtom(userAtom)
}

// 両方必要な場合のためのフック
export function useUserFull() {
  const user = useUser()
  const setUser = useSetUser()
  return { user, setUser }
}
