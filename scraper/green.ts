import { createClient } from "jsr:@supabase/supabase-js@2"
import { DOMParser, type Element } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts"
import "https://deno.land/std@0.203.0/dotenv/load.ts"
import { db } from "../app/lib/db.ts"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase credentials not found")
  Deno.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function scrapeGreen(id: number) {
  const url = `https://www.green-japan.com/company/${id}`
  const response = await fetch(url)

  if (response.status === 404) {
    console.log(`Company with ID ${id} not found. Skipping...`)
    return null
  }

  if (!response.ok) {
    console.error(`Failed to fetch data for ID ${id}: ${response.statusText}`)
    return null
  }

  const html = await response.text()
  const doc = new DOMParser().parseFromString(html, "text/html")

  if (!doc) {
    console.error(`Failed to parse HTML for ID ${id}`)
    return null
  }

  const companyData: Record<string, string | number | null> = { id }
  const infoItems = doc.querySelectorAll(".css-ikzlcq .css-1yjo05o")

  for (const item of infoItems) {
    const labelElement = (item as Element).querySelector(".MuiTypography-subtitle2")
    const valueElement = (item as Element).querySelector(".MuiTypography-body2")

    if (labelElement && valueElement) {
      const label = labelElement.textContent?.trim()
      const value = valueElement.textContent?.trim()

      if (label && value) {
        switch (label) {
          case "会社名":
            companyData.company_name = value
            break
          case "業界":
            companyData.industry = value
            break
          case "企業の特徴":
            companyData.company_features = value
            break
          case "資本金":
            companyData.capital = value
            break
          case "売上(3年分)":
            companyData.sales = value
            break
          case "設立年月":
            companyData.established_date = value
            break
          case "代表者氏名":
            companyData.ceo = value
            break
          case "事業内容":
            companyData.business_description = value
            break
          case "株式公開（証券取引所）":
            companyData.stock_listing = value
            break
          case "主要株主":
            companyData.major_shareholders = value
            break
          case "主要取引先":
            companyData.main_clients = value
            break
          case "従業員数":
            companyData.employee_count = Number.parseInt(value.replace(/[^0-9]/g, "")) || null
            break
          case "平均年齢":
            companyData.average_age = Number.parseFloat(value.replace("歳", "")) || null
            break
          case "本社住所":
            companyData.headquarters_address = value
            break
        }
      }
    }
  }

  return companyData
}

async function upsertCompanyData(data: Record<string, string | number | null>) {
  try {
    const { error } = await supabase.from("green").upsert(data, { onConflict: "id" })

    if (error) {
      throw error
    }

    console.log(`Data for ID ${data.id} inserted/updated successfully.`)
  } catch (error) {
    console.error(`Error upserting data for ID ${data.id}:`, error)
  }
}

async function main() {
  const startId = 10310
  const endId = 20000 // 適切な上限を設定してください

  for (let id = startId; id <= endId; id++) {
    const companyData = await scrapeGreen(id)

    if (companyData) {
      await upsertCompanyData(companyData)
    }

    // Rate limiting to avoid overloading the server
    await new Promise((resolve) => setTimeout(resolve, 1))
  }
}

main().catch(console.error)
