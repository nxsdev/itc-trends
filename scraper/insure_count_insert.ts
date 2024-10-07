// deno run --allow-net --allow-read --allow-env scraper/insure_count_insert.ts

import { type SupabaseClient, createClient } from "jsr:@supabase/supabase-js@2"
import { DOMParser, type Element } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts"
import "https://deno.land/std@0.203.0/dotenv/load.ts"
import { and, eq, gte, isNull, lt, or, sql } from "npm:drizzle-orm"
import { db } from "./db.ts"
import { companies as companiesTable, insuredCounts as insuredCountsTable } from "./schema.ts"

function convertJapaneseDate(dateString: string): string {
  const japaneseEraMap: { [key: string]: number } = {
    "\u660E\u6CBB": 1868, // 明治
    "\u5927\u6B63": 1912, // 大正
    "\u662D\u548C": 1926, // 昭和
    "\u5E73\u6210": 1989, // 平成
    "\u4EE4\u548C": 2019, // 令和
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

/**
 * 日本語の日付文字列を抽出して西暦の日付文字列に変換します
 * @param dateString
 */
function extractAndFormatDate(dateString: string): string | null {
  const match = dateString.match(/(\d{4})年(\d{2})月(\d{2})日/)
  if (match) {
    const [, year, month, day] = match
    return `${year}-${month}-${day}`
  }
  return null
}

async function fetchAndProcessCompanies(from: number, to: number) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const currentMonthString = `${currentYear}-${currentMonth.toString().padStart(2, "0")}`

  console.log("currentMonthString", currentMonthString)

  const startOfMonth = `${currentMonthString}-01`

  const latestCountsSubquery = db
    .select({
      companyId: insuredCountsTable.companyId,
      latestCountDate: sql<string>`MAX(${insuredCountsTable.countDate})`.as("latest_count_date"),
    })
    .from(insuredCountsTable)
    .where(gte(insuredCountsTable.countDate, sql`${startOfMonth}`))
    .groupBy(insuredCountsTable.companyId)
    .as("latest_counts")

  const companiesWithoutCurrentData = await db
    .select()
    .from(companiesTable)
    .leftJoin(latestCountsSubquery, eq(companiesTable.id, latestCountsSubquery.companyId))
    .where(isNull(latestCountsSubquery.companyId))
    .orderBy(companiesTable.id)
    .offset(from)
    .limit(to - from + 1)

  console.log("companies", companiesWithoutCurrentData.length)

  if (companiesWithoutCurrentData.length === 0) {
    console.log("No more companies to fetch")
    return false
  }

  const url = "https://www2.nenkin.go.jp/do/search_section"

  for (const company of companiesWithoutCurrentData) {
    const payload = {
      hdnPrefectureCode: "",
      hdnSearchOffice: "3",
      hdnSearchCriteria: "3",
      txtOfficeName: "",
      txtOfficeAddress: "",
      txtHoujinNo: company.companies.corporateNumber,
      hdnDisplayItemsRestorationScreenDto: "",
      hdnDisplayItemsRestorationScreenDtoKeepParam: "false",
      gmnId: "GB10001SC010",
      hdnErrorFlg: "",
      eventId: "/SEARCH.HTML",
      "/search.html": "",
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(payload),
    })

    if (!response.ok) {
      console.error("Failed to fetch data:", response)
      continue
    }

    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, "text/html")
    const updateDateElement = doc.querySelector(".basic_info_wp .update")

    // データ更新日を取得し、チェック
    const updateDateString = updateDateElement ? updateDateElement.textContent : null
    if (!updateDateString) {
      console.error("Failed fetching update date")
      continue
    }
    const updateDate = extractAndFormatDate(updateDateString)

    if (!updateDate) {
      console.error("Failed to parse update date")
      continue
    }

    const currentDate = new Date()
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    // if (new Date(updateDate) < currentMonthStart) {
    //   console.log("The process was terminated because the data was not updated.")
    //   continue
    // }

    const companyUrl = company.companies.url
    const rows = doc.querySelectorAll(".form_table tr")
    const data = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as Element
      const cells = row.querySelectorAll("td")

      if (cells.length === 8) {
        const company = {
          corporate_number: cells[2].textContent.trim(),
          name: cells[0].textContent.trim(),
          address: cells[1].textContent.trim(),
          is_expanded_coverage: cells[3].textContent.trim() !== "",
          is_active: cells[4].textContent.trim().includes("現存"),
          pension_office: cells[5].textContent.trim(),
          coverage_start_date: convertJapaneseDate(cells[6].textContent.trim()),
          url: companyUrl,
        }
        const insuredCount = {
          insured_count: Number.parseInt(cells[7].textContent.trim()),
          count_date: updateDate,
        }
        data.push({ company, insuredCount })
      }
    }
    if (data.length === 0) {
      console.log(
        "No data found for company:",
        company.companies.corporateNumber,
        company.companies.name
      )
      continue
    }
    console.log("Extracted data:", data)

    for (const item of data) {
      const { company, insuredCount } = item
      console.log("Inserting data:", company, insuredCount)

      const updatedCompany = {
        name: company.name,
        corporateNumber: company.corporate_number,
        address: company.address,
        isExpandedCoverage: company.is_expanded_coverage,
        isActive: company.is_active,
        pensionOffice: company.pension_office,
        coverageStartDate: company.coverage_start_date,
        url: company.url,
        updatedAt: new Date(),
      }

      const [insertedCompany] = await db
        .insert(companiesTable)
        .values(updatedCompany)
        .onConflictDoUpdate({
          target: companiesTable.corporateNumber,
          set: updatedCompany,
        })
        .returning()

      if (!insertedCompany) {
        console.error("Error inserting company")
        continue
      }

      try {
        await db.insert(insuredCountsTable).values({
          companyId: insertedCompany.id,
          insuredCount: insuredCount.insured_count,
          countDate: insuredCount.count_date,
        })
      } catch (error) {
        console.error("Error inserting insured count:", error)
      }
    }
  }

  return true
}
async function syncCompanies() {
  let from = 0
  const batchSize = 1000
  let hasMore = true

  while (hasMore) {
    console.log(`Processing companies from ${from} to ${from + batchSize - 1}`)
    hasMore = await fetchAndProcessCompanies(from, from + batchSize - 1)
    from += batchSize

    // オプション: 各バッチ処理の後に短い遅延を入れる
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log("All companies processed successfully")
}

// Run the main function
syncCompanies().catch(console.error)
