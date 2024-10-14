import { atom } from "jotai"

type EnvType = {
  APP_URL: string
}

export const envAtom = atom<EnvType | null>(null)
