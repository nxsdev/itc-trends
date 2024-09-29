import { Output, enum_, number, object, string } from "valibot"

export const PlanTypeSchema = enum_(["free", "pro", "vip"])
export type PlanType = Output<typeof PlanTypeSchema>

export const PLAN_LIMITS: Record<PlanType, number> = {
  free: 5,
  pro: 100,
  vip: Infinity,
}

export const DEFAULT_PLAN: PlanType = "free"

export const MONTHLY_RESET_DAY = 1 // 毎月1日にリセット
