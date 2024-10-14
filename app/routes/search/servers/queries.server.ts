import { AppLoadContext } from "@remix-run/cloudflare"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import {
  type SQL,
  and,
  asc,
  desc,
  eq,
  exists,
  getTableColumns,
  gte,
  inArray,
  isNotNull,
  lte,
  or,
  sql,
} from "drizzle-orm"
import type { User } from "schema"
import { companies, favorites, findy, insuredCounts } from "~/../schema"
import { type CompanyChart, type LimitOption, SortOption, type URLParamsType } from "../types"

export async function getCompanies(
  context: AppLoadContext,
  params: Partial<URLParamsType>,
  user?: User | null
): Promise<CompanyChart[]> {
  const { page, q, sort, exclude_inactive: excludeInactive, min_count, max_count, limit } = params
  // await new Promise((resolve) => setTimeout(resolve, 2000))
  console.log(page, q, sort, excludeInactive, min_count, max_count, limit)

  try {
    const companyColumns = getTableColumns(companies)

    // 各会社の最初と最後のinsured_countを取得するサブクエリ
    const initialCountSubquery = context.db
      .selectDistinctOn([insuredCounts.companyId], {
        companyId: insuredCounts.companyId,
        initialCount: insuredCounts.insuredCount,
        initialDate: insuredCounts.countDate,
      })
      .from(insuredCounts)
      .orderBy(insuredCounts.companyId, asc(insuredCounts.countDate))
      .as("initial_counts")

    const finalCountSubquery = context.db
      .selectDistinctOn([insuredCounts.companyId], {
        companyId: insuredCounts.companyId,
        finalCount: insuredCounts.insuredCount,
        latestDate: insuredCounts.countDate,
      })
      .from(insuredCounts)
      .orderBy(insuredCounts.companyId, desc(insuredCounts.countDate))
      .as("final_counts")

    const whereConditions = []

    if (q) {
      whereConditions.push(or(sql`${companies.name} &@~ ${q}`, eq(companies.corporateNumber, q)))
    }

    if (min_count !== undefined) {
      whereConditions.push(gte(finalCountSubquery.finalCount, min_count))
    }

    if (max_count !== undefined) {
      whereConditions.push(lte(finalCountSubquery.finalCount, max_count))
    }

    if (excludeInactive) {
      whereConditions.push(and(eq(companies.isActive, true)))
    }

    // 増加率と増加数の計算
    const increaseRate = sql`
      case 
        when ${initialCountSubquery.initialCount} = ${finalCountSubquery.finalCount} then 0
        when ${initialCountSubquery.initialCount} = 0 then 100
        else (${finalCountSubquery.finalCount} - ${initialCountSubquery.initialCount})::float / ${initialCountSubquery.initialCount} * 100
      end
    `.as("increase_rate")
    const increaseCount =
      sql`(${finalCountSubquery.finalCount} - ${initialCountSubquery.initialCount})`.as(
        "increase_count"
      )

    // ソート順の決定
    let orderByClause: SQL

    switch (sort) {
      case SortOption.Favorite:
        orderByClause = desc(companies.favoriteCount)
        break
      case SortOption.InsuredCount:
        orderByClause = desc(finalCountSubquery.finalCount)
        break
      case SortOption.IncreaseRate:
        orderByClause = desc(increaseRate)
        break
      case SortOption.IncreaseCount:
        orderByClause = desc(increaseCount)
        break
      default:
        orderByClause = desc(companies.favoriteCount)
    }

    const companiesWithCounts = await context.db
      .select({
        ...companyColumns,
        finalCount: finalCountSubquery.finalCount,
        initialCount: initialCountSubquery.initialCount,
        latestDate: finalCountSubquery.latestDate,
        increaseRate,
        increaseCount,
        totalCount: sql`count(*) over ()`.as("total_count"),
        findyId: findy.id,
        isFavorite: user
          ? exists(
              context.db
                .select()
                .from(favorites)
                .where(and(eq(favorites.companyId, companies.id), eq(favorites.userId, user.id)))
            )
          : sql`false`.as("is_favorite"),
      })
      .from(companies)
      .innerJoin(initialCountSubquery, eq(companies.id, initialCountSubquery.companyId))
      .innerJoin(finalCountSubquery, eq(companies.id, finalCountSubquery.companyId))
      .leftJoin(findy, eq(companies.id, findy.companyId))
      .where(and(...whereConditions))
      .orderBy(orderByClause, desc(isNotNull(findy.id)), asc(companies.id))
      .limit(limit as LimitOption)
      .offset(page ? (page - 1) * (limit as LimitOption) : 0)

    const insuredCountsData = await context.db.query.insuredCounts.findMany({
      where: inArray(
        insuredCounts.companyId,
        companiesWithCounts.map((company) => company.id)
      ),
      orderBy: [asc(insuredCounts.companyId), asc(insuredCounts.countDate)],
    })

    return companiesWithCounts.map((company): CompanyChart => {
      const companyInsuredCounts = insuredCountsData.filter((ic) => ic.companyId === company.id)
      const initialCount = Number(company.initialCount) ?? 0
      const finalCount = Number(company.finalCount) ?? 0
      const totalCount = Number(company.totalCount) ?? 0
      const countChange = finalCount - initialCount
      const percentChange = initialCount !== 0 ? (countChange / initialCount) * 100 : 0

      return {
        ...company,
        insuredCounts: companyInsuredCounts,
        initialCount,
        finalCount,
        totalCount,
        isFavorite: Boolean(company.isFavorite),
        periodSummary: {
          initialCount,
          finalCount,
          countChange,
          percentChange,
        },
        chartData: companyInsuredCounts.map((count) => {
          const date = new Date(count.countDate)
          return {
            month: format(date, "M月", { locale: ja }),
            insuredCount: count.insuredCount,
            countDate: format(date, "yyyy年M月d日", { locale: ja }),
          }
        }),
      }
    })
  } catch (error) {
    console.error(error)
    return []
  }
}
