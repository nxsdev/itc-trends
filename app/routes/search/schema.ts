import * as v from "valibot"
import { type LimitOption, SortOption, type URLParamsType } from "./types"

// URLパラメータのスキーマ定義
const URLParamsSchema = v.object({
  page: v.optional(v.coerce(v.number([v.finite()]), Number)),
  q: v.optional(v.string([v.maxLength(100)])),
  sort: v.optional(
    v.union([
      v.literal(SortOption.Favorite),
      v.literal(SortOption.InsuredCount),
      v.literal(SortOption.IncreaseCount),
      v.literal(SortOption.IncreaseRate),
    ])
  ),
  exclude_inactive: v.optional(v.transform(v.string(), (value) => value === "on")),
  min_count: v.optional(v.coerce(v.number([v.finite()]), Number)),
  max_count: v.optional(v.coerce(v.number([v.finite()]), Number)),
  limit: v.optional(v.union([v.literal(12), v.literal(24), v.literal(48)])),
})

const DEFAULT_VALUES: URLParamsType = {
  page: 1,
  q: "",
  sort: SortOption.Favorite,
  exclude_inactive: false,
  min_count: undefined,
  max_count: undefined,
  limit: 12 as LimitOption,
}

const PartialURLParamsSchema = v.partial(URLParamsSchema)

export type URLParams = v.Output<typeof PartialURLParamsSchema>

export function parseURLParams(request: Request): URLParamsType {
  const url = new URL(request.url)
  const rawParams = Object.fromEntries(url.searchParams)

  const result = v.safeParse(URLParamsSchema, rawParams)
  console.log(result)

  if (!result.success) {
    const validParams = result.output as Partial<URLParamsType>
    for (const issue of result.issues) {
      if (issue.path && issue.path.length > 0 && "key" in issue.path[0]) {
        const key = issue.path[0].key as keyof URLParamsType
        console.warn(`Invalid parameter: ${key}. Issue: ${issue.message}`)
        delete validParams[key]
      }
    }
    return {
      ...DEFAULT_VALUES,
      ...validParams,
    }
  }

  return {
    ...DEFAULT_VALUES,
    ...result.output,
  }
}
