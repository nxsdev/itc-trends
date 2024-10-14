import { AppLoadContext } from "@remix-run/cloudflare"
import { BadRequestError } from "~/lib/utils/errors"
import { getAuthenticator } from "~/services/auth.server"
import { AuthProvider } from "~/types/auth"
import { addOrRemoveFavorite } from "./commands.server"
import { scrapeCompanyData } from "./scrape.server"

/**
 * 会社のお気に入り状態を切り替えます。
 * お気に入りに登録されていた場合、お気に入りを削除します。
 * お気に入りに登録されていなかった場合、お気に入りを追加します。
 */
export async function handleFavorite(request: Request, context: AppLoadContext) {
  const formData = await request.formData()
  const companyId = formData.get("companyId") as string
  const favoriteCount = Number(formData.get("favoriteCount"))
  return await addOrRemoveFavorite(request, context, companyId, favoriteCount)
}

/**
 * 指定されたURLから会社データをスクレイピングします。
 */
export async function handleScrape(request: Request, context: AppLoadContext) {
  const formData = await request.formData()
  const corporateNumber = formData.get("corporate_number")
  const url = formData.get("url")

  if (typeof corporateNumber !== "string" || typeof url !== "string") {
    throw new BadRequestError("Invalid corporate number or URL")
  }

  const scrapedData = await scrapeCompanyData(request, context, corporateNumber, url)
  return { success: true, data: scrapedData }
}
