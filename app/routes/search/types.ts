import type { Company, InsuredCount } from "schema"

// 期間サマリーのインターフェース
interface PeriodSummary {
  initialCount: number
  finalCount: number
  countChange: number
  percentChange: number
}

// チャートデータポイントのインターフェース
interface ChartDataPoint {
  month: string
  insuredCount: number
  countDate: string
}

export interface CompanyChart extends Omit<Company, "createdAt" | "updatedAt"> {
  insuredCounts: Omit<InsuredCount, "createdAt">[]
  isFavorite: boolean
  initialCount: number
  finalCount: number
  totalCount: number
  periodSummary: PeriodSummary
  chartData: ChartDataPoint[]
}

export const SortOption = {
  /** お気に入り数順 */
  Favorite: "favorite",
  /** 被保険者数順 */
  InsuredCount: "insured_count",
  /** 増加数順 */
  IncreaseCount: "increase_count",
  /** 増加率順 */
  IncreaseRate: "increase_rate",
} as const

export type SortOptionValue = (typeof SortOption)[keyof typeof SortOption]

export type LimitOption = 12 | 24 | 48

export interface URLParamsType {
  page: number
  q: string
  sort: SortOptionValue
  exclude_inactive: boolean
  min_count: number | undefined
  max_count: number | undefined
  limit: LimitOption
}

export enum FavoriteAction {
  Added = 0,
  Removed = 1,
  NoChange = 2,
}

export type FavoriteResult = {
  action: FavoriteAction
  favoriteCount: number
  message?: string
}
