import { PARAM_ORDER } from "./constants"

export function sortSearchParams(params: URLSearchParams): URLSearchParams {
  const sortedParams = new URLSearchParams()

  for (const key of PARAM_ORDER) {
    const value = params.get(key)
    if (value !== null) {
      sortedParams.set(key, value)
    }
  }

  // 定義されていないパラメーターがあれば、最後に追加
  for (const [key, value] of params) {
    if (!PARAM_ORDER.includes(key as (typeof PARAM_ORDER)[number])) {
      sortedParams.set(key, value)
    }
  }
  return sortedParams
}
