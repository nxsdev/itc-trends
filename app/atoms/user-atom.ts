import { atom } from "jotai"
import type { User } from "schema"

export const userAtom = atom<User | null>(null)
