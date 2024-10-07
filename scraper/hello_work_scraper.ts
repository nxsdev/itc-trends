import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"
import "https://deno.land/std@0.203.0/dotenv/load.ts"

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
console.log(supabaseUrl)
console.log(supabaseServiceRoleKey)
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Supabase credentials not found")
  Deno.exit(1)
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const cookies: string[] = []
let jsessionid: string | null = null

// データ抽出ヘルパー関数
const extractData = (doc: Document, id: string) =>
  doc.querySelector(`#ID_${id}`)?.textContent.trim() || null

// 日付をISO形式に変換する関数
const convertToISODate = (dateString: string | null): string | null => {
  if (!dateString) return null

  // 和暦を西暦に変換するマッピング
  const eraMap: { [key: string]: number } = {
    令和: 2018,
    平成: 1988,
    昭和: 1925,
  }

  let year: number
  let month: number
  let day: number
  // 和暦の場合
  const eraMatch = dateString.match(/^(令和|平成|昭和)(\d+)年(\d+)月(\d+)日$/)
  if (eraMatch) {
    const era = eraMatch[1]
    const eraYear = Number.parseInt(eraMatch[2])
    year = eraMap[era] + eraYear
    month = Number.parseInt(eraMatch[3])
    day = Number.parseInt(eraMatch[4])
  } else {
    // 西暦の場合
    const westernMatch = dateString.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/)
    if (westernMatch) {
      year = Number.parseInt(westernMatch[1])
      month = Number.parseInt(westernMatch[2])
      day = Number.parseInt(westernMatch[3])
    } else {
      console.error(`Invalid date format: ${dateString}`)
      return null
    }
  }

  // 日付オブジェクトを作成し、ISO文字列に変換
  const date = new Date(year, month - 1, day)
  return date.toISOString().split("T")[0]
}

// 数値に変換する関数（改善版）
const convertToNumber = (value: string | null): number | null => {
  if (!value) return null
  const cleanedValue = value.replace(/[^\d.-]/g, "")
  const num = Number.parseInt(cleanedValue, 10)
  return Number.isNaN(num) ? null : num
}

// 給与情報を処理する関数（改善版）
const processSalary = (salaryString: string | null): { min: number | null; max: number | null } => {
  if (!salaryString) return { min: null, max: null }
  const parts = salaryString.split(/[〜～]/) // 波ダッシュと全角チルダの両方に対応
  const result = {
    min: convertToNumber(parts[0]),
    max: parts.length > 1 ? convertToNumber(parts[1]) : null,
  }
  return result
}

// 単位付きの数値を処理する関数
const processUnitValue = (valueString: string | null): number | null => {
  if (!valueString) return null
  const numericPart = valueString.replace(/[^0-9]/g, "")
  const result = Number.parseInt(numericPart, 10)
  return isNaN(result) ? null : result
}

// 真偽値に変換する関数
const convertToBoolean = (value: string | null): boolean => {
  return value === "あり" || value === "可"
}

// 年齢制限を解析する関数
const parseAgeLimit = (ageLimit: string | null): { min: number | null; max: number | null } => {
  if (!ageLimit) return { min: null, max: null }
  const matches = ageLimit.match(/(\d+)?歳?～(\d+)?歳?/)
  return {
    min: matches?.[1] ? Number.parseInt(matches[1]) : null,
    max: matches?.[2] ? Number.parseInt(matches[2]) : null,
  }
}

// 定年年齢を処理する関数
const processRetirementAge = (ageString: string | null): number | null => {
  if (!ageString) return null
  const match = ageString.match(/(\d+)歳/)
  return match ? Number.parseInt(match[1]) : null
}

// 就業時間を処理する関数
const processWorkHours = (
  timeString: string | null
): { start: string | null; end: string | null } => {
  if (!timeString) return { start: null, end: null }
  const parts = timeString.split("～")
  if (parts.length !== 2) return { start: null, end: null }

  const convertTime = (time: string): string | null => {
    const match = time.match(/(\d{1,2})時(\d{2})分/)
    if (!match) return null
    const [, hours, minutes] = match
    return `${hours.padStart(2, "0")}:${minutes}`
  }

  return {
    start: convertTime(parts[0]),
    end: convertTime(parts[1]),
  }
}

// companiesテーブルの更新関数
const updateCompany = async (
  corporateNumber: string,
  companyName: string,
  companyUrl: string | null
) => {
  const { data, error } = await supabase
    .from("companies")
    .upsert(
      {
        corporate_number: corporateNumber,
        name: companyName,
        url: companyUrl,
      },
      {
        onConflict: "corporate_number",
        update: ["url"],
      }
    )
    .select()

  if (error) {
    console.error("Error updating company:", error)
  } else {
    console.log(`Updated/Inserted company: ${corporateNumber}`)
  }

  return data
}

async function fetchAndProcessPage(url: string, page: number) {
  console.log(`Fetching page ${page}...`)

  const params = new URLSearchParams({
    kjKbnRadioBtn: "1",
    // searchBtn: "検索",
    kyujinkensu: "0",
    searchClear: "0",
    kiboSuruSKSU1Hidden: "09,4",
    summaryDisp: "false",
    searchInitDisp: "0",
    screenId: "GECA110010",
    maba_vrbs:
      "infTkRiyoDantaiBtn,searchShosaiBtn,searchBtn,searchNoBtn,searchClearBtn,dispDetailBtn,kyujinhyoBtn",
    preCheckFlg: "false",
    fwListNaviSortTop: "1",
    fwListNaviDispTop: "100",
    fwListNaviSortBtm: "1",
    fwListNaviDispBtm: "50",
    fwListNowPage: page.toString(),
    fwListLeftPage: "1",
    fwListNaviCount: "7",
    fwListNaviDisp: "50",
    fwListNaviSort: "1",
  })

  // pageが0の場合のみsearchBtnパラメータを追加
  if (page === 0) {
    params.append("searchBtn", "検索")
  }

  const response = await fetchWithSession(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  const html = await response.text()
  const doc = new DOMParser().parseFromString(html, "text/html")
  const jobNumbers = Array.from(doc.querySelectorAll(".width16em")).map((el) =>
    el.textContent.replace(/-/g, "")
  )

  for (const jobNumber of jobNumbers) {
    await processJobListing(jobNumber)
    // レート制限を考慮して少し待機
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // 次のページボタンが無効化されているかチェック
  const nextPageButton = doc.querySelector(
    'input[name="fwListNaviBtnNext"]'
  ) as HTMLInputElement | null
  const hasNextPage = nextPageButton && !nextPageButton.disabled

  return hasNextPage
}

async function fetchWithSession(url: string, options: RequestInit): Promise<Response> {
  const headers = new Headers(options.headers)
  headers.set("Host", "www.hellowork.mhlw.go.jp")
  headers.set("Accept", "*/*")
  headers.set("Connection", "keep-alive")
  headers.set("Accept-Encoding", "gzip, deflate, br")
  headers.set(
    "User-Agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  )

  if (jsessionid) {
    headers.set(
      "Cookie",
      `JSESSIONID=${jsessionid}; Domain=www.hellowork.mhlw.go.jp; Path=/kensaku`
    )
  }

  const updatedOptions = {
    ...options,
    headers: headers,
  }

  const response = await fetch(url, updatedOptions)

  const cookies = response.headers.get("set-cookie")
  const newJsessionid = cookies
    ?.split(";")
    .find((c) => c.trim().startsWith("JSESSIONID="))
    ?.split("=")[1]
  if (newJsessionid) {
    jsessionid = newJsessionid
  }

  return response
}

async function initializeSession(url: string) {
  const response = await fetchWithSession(url, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  })

  if (!jsessionid) {
    throw new Error("Failed to initialize session")
  }
}

async function processJobListing(jobNumber: string) {
  const detailPageUrl = `https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do?screenId=GECA110010&action=dispDetailBtn&kJNo=${jobNumber}&kJKbn=1&fullPart=1&tatZngy=1&shogaiKbn=0`
  const detailPageResponse = await fetch(detailPageUrl)
  const detailPageHtml = await detailPageResponse.text()
  const detailPageDoc = new DOMParser().parseFromString(detailPageHtml, "text/html")

  const ageLimitRange = extractData(detailPageDoc, "nenreiSegnHanni")
  const { min: ageLimitMin, max: ageLimitMax } = parseAgeLimit(ageLimitRange)

  const rawBaseSalary = extractData(detailPageDoc, "khky")
  const baseSalary = processSalary(rawBaseSalary)
  const rawFixedOvertimePay = extractData(detailPageDoc, "koteiZngy")
  const fixedOvertimePay = processSalary(rawFixedOvertimePay)

  const workHours = processWorkHours(extractData(detailPageDoc, "shgJn1"))

  const corporateNumber = extractData(detailPageDoc, "hoNinNo")
  const companyName = extractData(detailPageDoc, "jgshMei")
  const companyNameKana = extractData(detailPageDoc, "jgshMeiKana")
  const companyUrl = detailPageDoc.querySelector("#ID_hp")?.getAttribute("href") || null

  // companiesテーブルの更新
  if (corporateNumber) {
    await updateCompany(corporateNumber, companyName, companyNameKana, companyUrl)
  } else {
    console.warn(`Corporate number not found for job number: ${jobNumber}`)
    return
  }

  const jobData = {
    job_number: extractData(detailPageDoc, "kjNo"),
    corporate_number: corporateNumber,
    reception_date: convertToISODate(extractData(detailPageDoc, "uktkYmd")),
    expiration_date: convertToISODate(extractData(detailPageDoc, "shkiKigenHi")),
    public_employment_security_office: extractData(detailPageDoc, "juriAtsh"),
    job_category: extractData(detailPageDoc, "kjKbn"),
    online_application_accepted: convertToBoolean(
      extractData(detailPageDoc, "onlinJishuOboUktkKahi")
    ),
    industry_classification: extractData(detailPageDoc, "sngBrui"),
    trial_employment_desired: extractData(detailPageDoc, "tryKoyoKibo") === "希望する",
    company_name: companyName,
    company_name_kana: companyNameKana,
    company_postal_code: extractData(detailPageDoc, "szciYbn")?.replace("〒", ""),
    company_address: extractData(detailPageDoc, "szci"),
    company_website: companyUrl,
    job_title: extractData(detailPageDoc, "sksu"),
    job_description: extractData(detailPageDoc, "shigotoNy"),
    employment_type: extractData(detailPageDoc, "koyoKeitai"),
    is_dispatch: extractData(detailPageDoc, "hakenUkeoiToShgKeitai") !== "派遣・請負ではない",
    dispatch_license_number: extractData(detailPageDoc, "hakenUkeoiToRdsha"),
    employment_period: extractData(detailPageDoc, "koyoKikan"),
    work_location_postal_code: extractData(detailPageDoc, "shgBsYubinNo")?.replace("〒", ""),
    work_location_address: extractData(detailPageDoc, "shgBsJusho"),
    nearest_station: extractData(detailPageDoc, "shgBsMyorEki"),
    commute_time: convertToNumber(extractData(detailPageDoc, "shgBsShyoJn")),
    commute_method: extractData(detailPageDoc, "shgBsKotsuShudan"),
    smoking_policy: extractData(detailPageDoc, "shgBsKitsuTsak"),
    car_commute_allowed: convertToBoolean(extractData(detailPageDoc, "mycarTskn")),
    base_salary_min: baseSalary.min,
    base_salary_max: baseSalary.max,
    fixed_overtime_pay: fixedOvertimePay.min,
    salary_type: extractData(detailPageDoc, "chgnKeitaiToKbn"),
    payment_date: extractData(detailPageDoc, "chgnSrbi"),
    bonus_system: convertToBoolean(extractData(detailPageDoc, "shoyoSdNoUmu")),
    salary_raise_system: convertToBoolean(extractData(detailPageDoc, "shokyuSd")),
    work_hours_start: workHours.start,
    work_hours_end: workHours.end,
    break_time: convertToNumber(extractData(detailPageDoc, "kyukeiJn")),
    overtime_hours_average: convertToNumber(extractData(detailPageDoc, "thkinJkgiRodoJn")),
    annual_holidays: convertToNumber(extractData(detailPageDoc, "nenkanKjsu")),
    holidays: extractData(detailPageDoc, "kyjs"),
    insurance_coverage: extractData(detailPageDoc, "knyHoken"),
    retirement_system: convertToBoolean(extractData(detailPageDoc, "tskinSd")),
    retirement_age: processRetirementAge(extractData(detailPageDoc, "tnseiTeinenNenrei")),
    rehiring_system: convertToBoolean(extractData(detailPageDoc, "saiKoyoSd")),
    age_limit_min: ageLimitMin,
    age_limit_max: ageLimitMax,
    age_limit_reason: extractData(detailPageDoc, "nenreiSegnNoRy"),
    required_experience: extractData(detailPageDoc, "hynaKikntShsi"),
    required_licenses: extractData(detailPageDoc, "hynaMenkyoSkku"),
    hiring_count: convertToNumber(extractData(detailPageDoc, "saiyoNinsu")),
    selection_methods: extractData(detailPageDoc, "selectHoho"),
    application_method: extractData(detailPageDoc, "oboShoruiNoSofuHoho"),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  console.log(`Job data to be inserted: ${JSON.stringify(jobData, null, 2)}`)

  // job_listingsテーブルにデータを挿入
  const { data, error } = await supabase.from("job_listings").upsert(jobData, {
    onConflict: "job_number",
    returning: "minimal",
  })

  if (error) {
    console.error("Error inserting job data:", error)
  } else {
    console.log(`Inserted/Updated job data for job number: ${jobData.job_number}`)
  }
}

async function main() {
  const baseUrl = "https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do"

  // セッションの初期化
  await initializeSession(baseUrl)

  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    hasNextPage = await fetchAndProcessPage(baseUrl, page)
    page++
    // ページ間の待機時間
    await new Promise((resolve) => setTimeout(resolve, 10))
  }

  console.log("Data scraping and insertion completed")
}

// メイン処理の実行
main().catch(console.error)
