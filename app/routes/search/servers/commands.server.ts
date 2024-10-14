import { AppLoadContext } from "@remix-run/cloudflare"
import { eq, sql } from "drizzle-orm"
import { companies, favorites } from "~/../schema"
import { AuthenticationError } from "~/lib/utils/errors"
import { getAuthenticator } from "~/services/auth.server"
import { FavoriteAction, type FavoriteResult } from "../types"

export async function addOrRemoveFavorite(
  request: Request,
  context: AppLoadContext,
  companyId: string,
  favoriteCount: number
): Promise<FavoriteResult> {
  const user = await getAuthenticator(context).isAuthenticated(request)

  if (!user) {
    throw new AuthenticationError("ユーザー情報の取得に失敗しました")
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
      if (userFavorites.length >= 6 && user.plan === "free") {
        // 制限に達した場合、追加せずに早期リターン
        return {
          action: FavoriteAction.NoChange,
          favoriteCount: favoriteCount,
          message: "フリープランでは最大6件まで登録できます",
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
