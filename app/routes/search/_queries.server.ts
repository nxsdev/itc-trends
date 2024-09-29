import type { User } from "@supabase/supabase-js"
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
import {
  type Company,
  type InsuredCount,
  companies,
  favorites,
  findy,
  insuredCounts,
} from "~/../schema"
import { createSupabaseClient } from "~/lib/supabase/client.server"
import { URLParams } from "./schema"
import {
  type CompanyChart,
  FavoriteAction,
  type FavoriteResult,
  type LimitOption,
  SortOption,
  type URLParamsType,
} from "./types"
import { AppLoadContext } from "@remix-run/cloudflare"

export async function getCompanies(
  context: AppLoadContext,
  params: Partial<URLParamsType>,
  user?: User,
): Promise<CompanyChart[]> {
  const { page, q, sort, exclude_inactive: excludeInactive, min_count, max_count, limit } = params
  // await new Promise((resolve) => setTimeout(resolve, 1000))
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
      const initialCount = company.initialCount ?? 0
      const finalCount = company.finalCount ?? 0
      const totalCount = company.totalCount ?? 0
      return {
        ...company,
        insuredCounts: companyInsuredCounts,
        initialCount: Number(initialCount),
        finalCount: Number(finalCount),
        totalCount: Number(totalCount),
        isFavorite: Boolean(company.isFavorite),
      }
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function addOrRemoveFavorite(
  request: Request,
  context: AppLoadContext,
  companyId: string,
  favoriteCount: number
): Promise<FavoriteResult> {
  const { supabase } = createSupabaseClient(request, context)
  const {
    data: { session },
    error,
  } = await supabase.locals.getSession()
  if (error) {
    throw new Error(error.message)
  }

  const user = session?.user

  if (!user) {
    throw new Error("Failed to get user")
  }

  return await context.db.transaction(async (tx) => {
    const userFavorites = await tx.query.favorites.findMany({
      where: eq(favorites.userId, user.id),
    })
    const favorite = userFavorites.find((favorite) => favorite.companyId === companyId)

    let action: FavoriteAction
    let message: string | undefined

    if (favorite) {
      // お気に入りを削除
      await tx.delete(favorites).where(eq(favorites.id, favorite.id))
      action = FavoriteAction.Removed
      message = "お気に入り登録を解除しました"
    } else {
      if (userFavorites.length >= 6 && user.app_metadata.plan === "free") {
        // 制限に達した場合、追加せずに早期リターン
        return {
          action: FavoriteAction.NoChange,
          favoriteCount: favoriteCount,
          message:
            "フリープランでは最大6件まで登録できます",
        }
      }
      await tx.insert(favorites).values({ userId: user.id, companyId })
      action = FavoriteAction.Added
      message = "お気に入りに追加しました"
    }

    // companiesテーブルのfavoriteCountを更新（NoChangeの場合は実行されない）
    const [updatedCompany] = await tx
      .update(companies)
      .set({
        favoriteCount: sql`${companies.favoriteCount} ${sql.raw(
          action === FavoriteAction.Added ? "+" : "-"
        )} 1`,
      })
      .where(eq(companies.id, companyId))
      .returning({
        favoriteCount: companies.favoriteCount,
      })

    return {
      action,
      favoriteCount: updatedCompany.favoriteCount,
      message,
    }
  })
}
