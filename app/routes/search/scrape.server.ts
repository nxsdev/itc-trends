import { Response } from "@cloudflare/workers-types"
import { AppLoadContext } from "@remix-run/cloudflare"
import { and, eq, gte } from "drizzle-orm"
import { HTMLRewriter } from "html-rewriter-wasm"
import { companies, companyRegistrationRequests } from "~/../schema"
import { db } from "~/lib/db"
import { createSupabaseClient } from "~/lib/supabase/client.server"
import { ErrorResponse, ErrorType, createErrorResponse } from "~/types/errors"

function convertJapaneseDate(dateString: string): string {
  const japaneseEraMap: { [key: string]: number } = {
    明治: 1868,
    大正: 1912,
    昭和: 1926,
    平成: 1989,
    令和: 2019,
  }

  const match = dateString.match(/(\D+)(\d+)年(\d+)月(\d+)日/)
  if (!match) {
    throw new Error("Invalid date string format")
  }

  const [_, era, year, month, day] = match
  const baseYear = japaneseEraMap[era]
  if (baseYear === undefined) {
    throw new Error(`Unknown era: ${era}`)
  }

  const westernYear = baseYear + Number.parseInt(year) - 1
  return `${westernYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

export async function scrapeCompanyData(
  request: Request,
  context: AppLoadContext,
  corporateNumber: string,
  url?: string
): Promise<ErrorResponse | { success: true; data: any }> {
  const { supabase } = createSupabaseClient(request, context)
  const {
    data: { session },
    error,
  } = await supabase.locals.getSession()
  if (error || !session?.user) {
    return createErrorResponse(ErrorType.AUTHENTICATION, "登録にはサインインが必要です。")
  }

  const user = session.user

  // 現在の月の開始日を取得
  const currentMonthStart = new Date()
  currentMonthStart.setDate(1)
  currentMonthStart.setHours(0, 0, 0, 0)

  // 現在の月間登録件数を取得
  const monthlyRegistrations = await db
    .select()
    .from(companyRegistrationRequests)
    .where(
      and(
        eq(companyRegistrationRequests.userId, user.id),
        gte(companyRegistrationRequests.registeredAt, currentMonthStart)
      )
    )

  // プランに応じて登録を制限
  const monthlyLimit = user.app_metadata.plan === "pro" ? 100 : 5
  if (monthlyRegistrations.length >= monthlyLimit) {
    return createErrorResponse(
      ErrorType.MONTHLY_LIMIT,
      `月間の登録制限（${monthlyLimit}件）に達しました。`
    )
  }

  let rewriter: HTMLRewriter | undefined
  try {
    const payload = {
      hdnPrefectureCode: "",
      hdnSearchOffice: "3",
      hdnSearchCriteria: "3",
      txtOfficeName: "",
      txtOfficeAddress: "",
      txtHoujinNo: corporateNumber,
      hdnDisplayItemsRestorationScreenDto: "",
      hdnDisplayItemsRestorationScreenDtoKeepParam: "false",
      gmnId: "GB10001SC010",
      hdnErrorFlg: "",
      eventId: "/SEARCH.HTML",
      "/search.html": "",
    }

    console.log("Fetching data for corporate number:", corporateNumber)
    const response = await fetch("https://www2.nenkin.go.jp/do/search_section", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(payload),
    })

    if (!response.ok) {
      console.error("Failed to fetch data. Status:", response.status)
      return createErrorResponse(
        ErrorType.SERVER,
        `データの取得に失敗しました。ステータス: ${response.status}`
      )
    }

    let output = ""
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    rewriter = new HTMLRewriter((chunk) => {
      output += decoder.decode(chunk)
    })

    let scrapedData: any = {}
    let insuredCount = 0
    let currentRow: string[] = []

    rewriter
      .on(".form_table tr", {
        element(element) {
          element.onEndTag = () => {
            if (currentRow.length === 8) {
              scrapedData = {
                corporateNumber: currentRow[2],
                name: currentRow[0],
                address: currentRow[1],
                isExpandedCoverage: currentRow[3] !== "",
                isActive: currentRow[4].includes("現存"),
                pensionOffice: currentRow[5],
                coverageStartDate: convertJapaneseDate(currentRow[6]),
                url: url || null,
              }
              insuredCount = Number.parseInt(currentRow[7])
            }
            currentRow = [] // 次の行のために配列をリセット
          }
        },
      })
      .on(".form_table tr td", {
        text(text) {
          const content = text.text.trim()
          if (content) currentRow.push(content)
        },
      })
    console.log("Starting HTML parsing")
    await rewriter.write(encoder.encode(await response.text()))
    await rewriter.end()
    console.log("HTML parsing completed")

    if (!scrapedData.corporateNumber) {
      console.log("No company data found for corporate number:", corporateNumber)
      return createErrorResponse(ErrorType.VALIDATION, "該当する事業所が見つかりません。", {
        corporate_number: "該当する事業所がありません。検索条件を変更し、再検索をしてください。",
      })
    }

    console.log("Scraped data:", scrapedData)

    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.corporateNumber, corporateNumber))

    if (existingCompany.length > 0) {
      return createErrorResponse(ErrorType.VALIDATION, "この企業はすでに登録されています。", {
        corporate_number: "この企業はすでに登録されています。",
      })
    }

    return {
      ...scrapedData,
      insuredCount: {
        insuredCount,
        countDate: new Date().toISOString(),
      },
    }
  } catch (error: unknown) {
    console.error("Error in scrapeCompanyData:", error)
    return createErrorResponse(
      ErrorType.SERVER,
      error instanceof Error ? error.message : "データの取得中にエラーが発生しました。"
    )
  } finally {
    if (rewriter && typeof rewriter.free === "function") {
      rewriter.free()
    }
  }
}
