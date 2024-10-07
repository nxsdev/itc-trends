// deno run --allow-net --allow-env scraper/green_update_corporate_numbers.ts

import { createClient } from "jsr:@supabase/supabase-js@2"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts"
import "https://deno.land/std@0.203.0/dotenv/load.ts"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase credentials not found")
  Deno.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseKey)

function removeCompanyPrefix(companyName: string): string {
  const prefixes = ["株式会社", "合同会社", "有限会社", "㈱", "㈲", "(株)", "(有)"]
  let cleanName = companyName
  for (const prefix of prefixes) {
    cleanName = cleanName.replace(new RegExp(`^${prefix}\\s*|\\s*${prefix}$`, "g"), "")
  }
  return cleanName.trim()
}

function extractPrefecture(address: string): string | null {
  const prefectures = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ]

  for (const prefecture of prefectures) {
    if (address.includes(prefecture)) {
      return prefecture
    }
  }
  return null
}

function getPrefectureCode(prefecture: string): string | null {
  const prefectureCodes: { [key: string]: string } = {
    北海道: "01",
    青森県: "02",
    岩手県: "03",
    宮城県: "04",
    秋田県: "05",
    山形県: "06",
    福島県: "07",
    茨城県: "08",
    栃木県: "09",
    群馬県: "10",
    埼玉県: "11",
    千葉県: "12",
    東京都: "13",
    神奈川県: "14",
    新潟県: "15",
    富山県: "16",
    石川県: "17",
    福井県: "18",
    山梨県: "19",
    長野県: "20",
    岐阜県: "21",
    静岡県: "22",
    愛知県: "23",
    三重県: "24",
    滋賀県: "25",
    京都府: "26",
    大阪府: "27",
    兵庫県: "28",
    奈良県: "29",
    和歌山県: "30",
    鳥取県: "31",
    島根県: "32",
    岡山県: "33",
    広島県: "34",
    山口県: "35",
    徳島県: "36",
    香川県: "37",
    愛媛県: "38",
    高知県: "39",
    福岡県: "40",
    佐賀県: "41",
    長崎県: "42",
    熊本県: "43",
    大分県: "44",
    宮崎県: "45",
    鹿児島県: "46",
    沖縄県: "47",
  }

  return prefectureCodes[prefecture] || null
}

async function fetchCorporateNumber(companyName: string, address: string): Promise<string | null> {
  const cleanCompanyName = removeCompanyPrefix(companyName)
  const url = "https://www.houjin-bangou.nta.go.jp/kensaku-kekka.html"
  const formData = new FormData()

  formData.append(
    "jp.go.nta.houjin_bangou.framework.web.common.CNSFWTokenProcessor.request.token",
    "dummy-token"
  )
  formData.append("houzinNmShTypeRbtn", "2")
  formData.append("houzinNmTxtf", cleanCompanyName)
  formData.append("_kanaCkbx", "on")
  formData.append("_noconvCkbx", "on")
  formData.append("_enCkbx", "on")

  if (address) {
    const postalCode = address.match(/〒?\d{3}-?\d{4}/)
    if (postalCode) {
      formData.append("houzinAddrShTypeRbtn", "2")
      formData.append("zipCdTxtf", postalCode[0].replace(/[〒-]/g, ""))
    } else {
      const prefecture = extractPrefecture(address)
      if (prefecture) {
        const prefectureCode = getPrefectureCode(prefecture)
        if (prefectureCode) {
          formData.append("houzinAddrShTypeRbtn", "1")
          formData.append("prefectureLst", prefectureCode)
        }
      }
    }
  } else {
    console.log(`No address provided for ${companyName}. Searching without location filter.`)
  }

  formData.append("houzinNoShTyoumeSts", "0")
  formData.append("houzinNoShSonotaZyoukenSts", "0")
  formData.append("_houzinKdCkbx", "on")
  formData.append("_historyCkbx", "on")
  formData.append("_hideCkbx", "on")
  formData.append("closeCkbx", "1")
  formData.append("_closeCkbx", "on")
  formData.append("_chgYmdShTargetCkbx", "on")
  formData.append("orderRbtn", "1")
  formData.append("houzinKdRbtn", "0")
  formData.append("searchFlg", "1")
  formData.append("preSyousaiScreenId", "KJSCR0101010")

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    console.error(`Failed to fetch data for ${companyName}: ${response.statusText}`)
    return null
  }

  const html = await response.text()
  const doc = new DOMParser().parseFromString(html, "text/html")

  if (!doc) {
    console.error(`Failed to parse HTML for ${companyName}`)
    return null
  }

  const resultCount = doc.querySelector(".srhResult strong")?.textContent
  if (resultCount !== "1") {
    console.log(`Skipping ${companyName}: ${resultCount} results found`)
    return null
  }

  const corporateNumber = doc.querySelector(".tbl01 tbody tr th")?.textContent?.trim()
  return corporateNumber || null
}

async function fetchAllGreenCompanies() {
  let allCompanies = []
  let lastId = 0
  const pageSize = 1000 // Supabaseのデフォルト最大値

  while (true) {
    const { data, error } = await supabase
      .from("green")
      .select("id, company_name, headquarters_address")
      .is("company_id", null)
      .order("id", { ascending: true })
      .gt("id", lastId)
      .limit(pageSize)

    if (error) {
      console.error("Error fetching green companies:", error.message)
      break
    }

    if (data.length === 0) {
      break // すべてのデータを取得完了
    }

    allCompanies = allCompanies.concat(data)
    lastId = data[data.length - 1].id

    console.log(`Fetched ${allCompanies.length} companies so far...`)

    if (data.length < pageSize) {
      break // 最後のページ
    }
  }

  return allCompanies
}

async function updateCompanyId(greenId: number, companyName: string, corporateNumber: string) {
  let companyId: string

  try {
    // Check if the company exists in the companies table
    const { data: existingCompanies, error: selectError } = await supabase
      .from("companies")
      .select("id")
      .eq("corporate_number", corporateNumber)

    if (selectError) {
      throw new Error(`Error checking for existing company: ${selectError.message}`)
    }

    if (existingCompanies && existingCompanies.length > 0) {
      if (existingCompanies.length > 1) {
        console.warn(
          `Multiple companies found for corporate number ${corporateNumber}. Using the first one.`
        )
      }
      companyId = existingCompanies[0].id
    } else {
      // Insert a new company if it doesn't exist
      const { data: newCompany, error: insertError } = await supabase
        .from("companies")
        .insert({ name: companyName, corporate_number: corporateNumber })
        .select("id")
        .single()

      if (insertError || !newCompany) {
        throw new Error(
          `Error inserting new company: ${insertError?.message || "No data returned"}`
        )
      }

      companyId = newCompany.id
    }

    // Update the green table with the company_id
    const { error: updateError } = await supabase
      .from("green")
      .update({ company_id: companyId })
      .eq("id", greenId)

    if (updateError) {
      throw new Error(`Error updating green table for id ${greenId}: ${updateError.message}`)
    }

    console.log(`Updated company_id for ${companyName} (Green ID: ${greenId})`)
  } catch (error) {
    console.error(
      `Failed to update company ID for ${companyName} (Green ID: ${greenId}):`,
      error.message
    )
    // ここでエラーをスローまたは処理を継続するかを決定できます
  }
}

async function main() {
  const greenCompanies = await fetchAllGreenCompanies()
  console.log(`Total companies fetched: ${greenCompanies.length}`)

  for (const company of greenCompanies) {
    try {
      const corporateNumber = await fetchCorporateNumber(
        company.company_name,
        company.headquarters_address || null
      )
      if (corporateNumber) {
        await updateCompanyId(company.id, company.company_name, corporateNumber)
      }
    } catch (error) {
      console.error(`Error processing company ${company.company_name}:`, error)
    }
    // サーバーへの負荷を軽減するための遅延
    // await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

main().catch(console.error)
