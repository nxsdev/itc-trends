export const ACTIONS = {
  SIGN_IN: "sign-in",
  SIGN_OUT: "sign-out",
  FAVORITE: "favorite",
  SCRAPE: "scrape",
} as const satisfies Readonly<Record<string, string>>

export const MIN_PRESETS = [0, 30, 50, 100] as const satisfies Readonly<number[]>
export const MAX_PRESETS = [100, 300, 500, 1000] as const satisfies Readonly<number[]>

export const PARAM_ORDER = [
  "q",
  "page",
  "limit",
  "sort",
  "exclude_inactive",
  "min_count",
  "max_count",
  "region",
  "pref",
] as const satisfies Readonly<string[]>
