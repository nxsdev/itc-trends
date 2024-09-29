// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "jsr:@supabase/supabase-js@2"
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts"

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

  const westernYear = baseYear + parseInt(year) - 1
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


Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response("Supabase credentials not found", { status: 500 })
  }
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 2
  const currentMonthString = `${currentYear}-${currentMonth.toString().padStart(2, "0")}`

  console.log("Current month:", currentMonthString)
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .lt("updated_at", `${currentMonthString}-01`)
    .order("created_at", { ascending: false })
    .limit(1000)

  if (!companies || companies.length === 0) {
    return new Response("No data to fetch", { status: 200 })
  }
  const url = "https://www2.nenkin.go.jp/do/search_section"

  for (const company of companies) {
    const payload = {
      hdnPrefectureCode: "",
      hdnSearchOffice: "3",
      hdnSearchCriteria: "3",
      txtOfficeName: "",
      txtOfficeAddress: "",
      txtHoujinNo: company.corporate_number,
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
      return new Response("Failed fetching update date", { status: 500 })
    }
    const updateDate = extractAndFormatDate(updateDateString)

    if (!updateDate) {
      return new Response("Failed to parse update date", { status: 500 })
    }

    const currentDate = new Date()
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    if (new Date(updateDate) < currentMonthStart) {
      return new Response("The process was terminated because the data was not updated.", {
        status: 200,
      })
    }

    // const companyUrl = company.url || (await fetchCompanyUrl(company.corporate_number))
    const companyUrl = company.url
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
          insured_count: parseInt(cells[7].textContent.trim()),
          count_date: updateDate,
        }
        data.push({ company, insuredCount })
      }
    }
    console.log("Extracted data:", data)

    for (const item of data) {
      const { company, insuredCount } = item
      console.log("Inserting data:", company, insuredCount)

      const now = new Date().toISOString() // これはUTCのISO 8601形式の文字列を生成します

      const updatedCompany = {
        ...company,
        updated_at: now,
      }
      const { data: insertedCompany, error: companyError } = await supabase
        .from("companies")
        .upsert(updatedCompany, {
          onConflict: "corporate_number",
          returning: "id",
        })
        .select("id")
        .single()

      if (companyError) {
        console.error("Error inserting company:", companyError)
        continue
      }

      const { error: insuredCountError } = await supabase
        .from("insured_counts")
        .insert({ ...insuredCount, company_id: insertedCompany.id })

      if (insuredCountError) {
        console.error("Error inserting insured count:", insuredCountError)
        continue
      }
    }
  }
  return new Response("Data inserted successfully", { status: 200 })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sync-companies' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
