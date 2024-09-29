// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "jsr:@supabase/supabase-js@2"
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts"

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response("Supabase credentials not found", { status: 500 })
  }
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

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

    let year, month, day

    // 和暦の場合
    const eraMatch = dateString.match(/^(令和|平成|昭和)(\d+)年(\d+)月(\d+)日$/)
    if (eraMatch) {
      const era = eraMatch[1]
      const eraYear = parseInt(eraMatch[2])
      year = eraMap[era] + eraYear
      month = parseInt(eraMatch[3])
      day = parseInt(eraMatch[4])
    } else {
      // 西暦の場合
      const westernMatch = dateString.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/)
      if (westernMatch) {
        year = parseInt(westernMatch[1])
        month = parseInt(westernMatch[2])
        day = parseInt(westernMatch[3])
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
    const num = parseInt(cleanedValue, 10)
    return isNaN(num) ? null : num
  }

  // 給与情報を処理する関数（改善版）
  const processSalary = (
    salaryString: string | null
  ): { min: number | null; max: number | null } => {
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
    const result = parseInt(numericPart, 10)
    return isNaN(result) ? null : result
  }
  // 年齢制限を解析する関数
  const parseAgeLimit = (ageLimit: string | null): { min: number | null; max: number | null } => {
    if (!ageLimit) return { min: null, max: null }
    const matches = ageLimit.match(/(\d+)?歳?～(\d+)?歳?/)
    return {
      min: matches && matches[1] ? parseInt(matches[1]) : null,
      max: matches && matches[2] ? parseInt(matches[2]) : null,
    }
  }

  // 定年年齢を処理する関数
  const processRetirementAge = (ageString: string | null): number | null => {
    if (!ageString) return null
    const match = ageString.match(/(\d+)歳/)
    return match ? parseInt(match[1]) : null
  }

  // 真偽値に変換する関数
  const convertToBoolean = (value: string | null): boolean => {
    return value === "あり" || value === "可"
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
    companyNameKana: string,
    companyUrl: string | null
  ) => {
    const { data, error } = await supabase
      .from("companies")
      .upsert(
        {
          corporate_number: corporateNumber,
          name: companyName,
          name_kana: companyNameKana,
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

  // 一覧ページからデータを取得
  const listPageUrl = "https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do"
  const listPageResponse = await fetch(listPageUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "kjKbnRadioBtn=1&searchBtn=検索&kyujinkensu=0&searchClear=0&kiboSuruSKSU1Hidden=09,4&summaryDisp=false&searchInitDisp=0&screenId=GECA110010&maba_vrbs=infTkRiyoDantaiBtn,searchShosaiBtn,searchBtn,searchNoBtn,searchClearBtn,dispDetailBtn,kyujinhyoBtn&preCheckFlg=false&fwListNaviSortTop=1&fwListNaviDispTop=100&fwListNaviSortBtm=1&fwListNaviDispBtm=50&fwListNowPage=1&fwListLeftPage=1&fwListNaviCount=7&fwListNaviDisp=50&fwListNaviSort=1",
  })

  const listPageHtml = await listPageResponse.text()
  const listPageDoc = new DOMParser().parseFromString(listPageHtml, "text/html")
  const jobNumbers = Array.from(listPageDoc.querySelectorAll(".width16em")).map((el) =>
    el.textContent.replace(/-/g, "")
  )

  for (const jobNumber of jobNumbers) {
    // 詳細ページからデータを取得
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

    // Supabaseにデータを挿入
    const { data, error } = await supabase.from("job_listings").upsert(jobData, {
      onConflict: "job_number",
      returning: "minimal",
    })

    if (error) {
      console.error("Error inserting data:", error)
    } else {
      console.log(`Inserted/Updated data for job number: ${jobData.job_number}`)
    }

    // レート制限を考慮して少し待機
    await new Promise((resolve) => setTimeout(resolve, 10))
    // testのため１回で終了
    // return new Response("Data scraping and insertion completed", { status: 200 })
  }

  return new Response("Data scraping and insertion completed", { status: 200 })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-work-fetch' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
