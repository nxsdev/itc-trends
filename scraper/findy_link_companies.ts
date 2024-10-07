// deno run --allow-net --allow-env --allow-read scraper/findy_link_companies.ts

import { and, eq, isNull, or } from "npm:drizzle-orm"
import { DOMParser, type Element } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts"
import { db } from "./db.ts"
import { companies as companiesTable, findy as findyTable } from "./schema.ts"

function removeCompanyPrefix(companyName: string): string {
  const prefixes = ["株式会社", "合同会社", "有限会社", "㈱", "㈲", "(株)", "(有)"]
  let cleanName = companyName
  for (const prefix of prefixes) {
    cleanName = cleanName.replace(new RegExp(`^${prefix}\\s*|\\s*${prefix}$`, "g"), "")
  }
  return cleanName.trim()
}

function normalizeCompanyName(name: string): string {
  return name
    .replace(/\s+/g, "")
    .replace(/[A-Za-z0-9]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0xfee0))
}

function extractCompanyName(cell: Element): string {
  const furigana = cell.querySelector(".furigana")
  if (furigana) {
    furigana.remove() // ふりがな要素を削除
  }
  return cell.textContent?.trim() || ""
}

function normalizeAddress(address: string): string {
  return address
    .replace(/[\s（）()・\-－]/g, "") // スペース、括弧、ハイフン、中黒を削除
    .replace(/[0-9a-zA-Z]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0xfee0)) // 半角英数字を全角に変換
    .replace(/([０-９]+)丁目/, "$1") // "丁目"を削除
    .replace(/([０-９]+)番地?/, "$1") // "番地"を削除
    .replace(/([０-９]+)号/, "$1") // "号"を削除
}

function extractMainAddress(address: string): string {
  // 都道府県、市区町村、番地までを抽出
  const match = address.match(/^(.+?[都道府県].+?[市区町村].+?[０-９]+(-[０-９]+)*)/)
  return match ? match[1] : address
}

function normalizeNumbers(address: string): string {
  // 番地を正規化：連続する数字をハイフンで区切る
  return address
    .replace(/([０-９]+)/g, (match, p1, offset, string) => {
      // 前の文字が数字でない場合のみ、ハイフンを追加
      return offset > 0 && /[０-９]/.test(string[offset - 1]) ? p1 : `-${p1}`
    })
    .replace(/^-/, "") // 先頭のハイフンを削除
}

function compareAddresses(address1: string, address2: string): boolean {
  const normalized1 = normalizeNumbers(normalizeAddress(extractMainAddress(address1)))
  const normalized2 = normalizeNumbers(normalizeAddress(extractMainAddress(address2)))

  // デバッグ用のログ出力
  console.log(`Comparing: "${normalized1}" and "${normalized2}"`)

  // 完全一致の場合
  return normalized1 === normalized2
}
// 法人番号検索関数（提供されたコードをそのまま使用）
async function fetchCorporateNumber(companyName: string, address: string): Promise<string | null> {
  const cleanCompanyName = removeCompanyPrefix(companyName)
  const url = "https://www.houjin-bangou.nta.go.jp/kensaku-kekka.html"
  const formData = new FormData()

  formData.append(
    "jp.go.nta.houjin_bangou.framework.web.common.CNSFWTokenProcessor.request.token",
    "dummy-token"
  )
  formData.append("houzinNmShTypeRbtn", "2")
  formData.append("houzinNmTxtf", companyName)
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
  const rows = doc.querySelectorAll(".tbl01 tbody tr")

  if (resultCount === "1" || rows.length === 1) {
    // 結果が1件の場合、完全一致チェックを行わずに法人番号を返す
    const corporateNumber = (rows[0] as Element).querySelector("th")?.textContent?.trim() || null
    console.log(`Single result found for ${companyName}: ${corporateNumber}`)
    return corporateNumber
  }

  const normalizedSearchName = normalizeCompanyName(companyName)
  const matches = []

  for (const row of rows) {
    const nameCell = row.querySelector("td")
    const addressCell = row.querySelectorAll("td")[1]
    const numberCell = row.querySelector("th")
    if (nameCell && addressCell && numberCell) {
      const extractedName = extractCompanyName(nameCell as Element)
      const normalizedExtractedName = normalizeCompanyName(extractedName)
      const extractedAddress = addressCell.textContent || ""

      if (normalizedExtractedName === normalizedSearchName) {
        matches.push({
          name: extractedName,
          address: extractedAddress,
          number: numberCell.textContent?.trim() || null,
        })
      }
    }
  }

  if (matches.length === 1) {
    console.log(`Exact match found for ${companyName}: ${matches[0].number}`)
    return matches[0].number
  } else if (matches.length > 1) {
    // 住所の一致を確認
    const addressMatch = matches.find((match) => compareAddresses(match.address, address))
    if (addressMatch) {
      console.log(
        `Exact match found for ${companyName} with matching address: ${addressMatch.number}`
      )
      return addressMatch.number
    } else {
      console.log(
        `Multiple exact matches found for ${companyName}, but no matching address. Matches:`,
        matches.map((m) => ({
          name: m.name,
          address: normalizeNumbers(normalizeAddress(extractMainAddress(m.address))),
          number: m.number,
        }))
      )
      return null
    }
  } else {
    console.log(`No exact match found for ${companyName}`)
    return null
  }
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

async function fetchAllFindyCompanies() {
  return await db.select().from(findyTable).where(isNull(findyTable.companyId))
}

async function updateCompanyId(
  findyId: number,
  companyName: string,
  url: string | null,
  location: string | null
) {
  try {
    // Fetch corporate number
    const corporateNumber = await fetchCorporateNumber(companyName, location || "")

    if (!corporateNumber) {
      console.log(`Could not find corporate number for ${companyName}. Skipping...`)
      return
    }

    // Check if the company exists in the companies table using corporate number
    const existingCompany = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.corporateNumber, corporateNumber))
      .limit(1)

    let companyId: string

    if (existingCompany.length > 0) {
      companyId = existingCompany[0].id

      // Update URL if it's not set in the companies table
      if (url && url !== "-" && !existingCompany[0].url) {
        await db.update(companiesTable).set({ url: url }).where(eq(companiesTable.id, companyId))
        console.log(`Updated URL for company ${companyName}`)
      }
    } else {
      // Insert a new company if it doesn't exist
      const [newCompany] = await db
        .insert(companiesTable)
        .values({
          name: companyName,
          url: url,
          corporateNumber: corporateNumber,
        })
        .returning({ id: companiesTable.id })

      companyId = newCompany.id
      console.log(`Inserted new company: ${companyName}`)
    }

    // Update the findy table with the company_id
    await db.update(findyTable).set({ companyId: companyId }).where(eq(findyTable.id, findyId))

    console.log(`Updated company_id for ${companyName} (Findy ID: ${findyId})`)
  } catch (error) {
    console.error(
      `Failed to update company ID for ${companyName} (Findy ID: ${findyId}):`,
      error.message
    )
  }
}

async function main() {
  const findyCompanies = await fetchAllFindyCompanies()
  console.log(`Total companies fetched: ${findyCompanies.length}`)

  for (const company of findyCompanies) {
    try {
      await updateCompanyId(
        company.id,
        company.companyName ?? "",
        company.url ?? null,
        company.location ?? null
      )
    } catch (error) {
      console.error(`Error processing company ${company.companyName}:`, error)
    }
    // サーバーへの負荷を軽減するための遅延
    await new Promise((resolve) => setTimeout(resolve, 1))
  }
}

main()
  .catch(console.error)
  .finally(() => client.end())
