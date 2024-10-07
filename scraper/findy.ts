// deno run --allow-net --allow-read --allow-env scraper/findy.ts

import { eq } from "npm:drizzle-orm"
import { integer, pgTable, serial, text, varchar } from "npm:drizzle-orm/pg-core"
// @ts-ignore
import { DOMParser, type Element } from "https://deno.land/x/deno_dom@v0.1.46/deno-dom-wasm.ts"
import { db } from "./db.ts"

// Define the database schema
const findyTable = pgTable("findy", {
  id: serial("id").primaryKey(),
  companyName: text("company_name"),
  location: text("location"),
  description: text("description"),
  establishedAt: text("established_at"),
  president: text("president"),
  url: varchar("url", { length: 255 }),
  company_id: integer("company_id"),
})

async function scrapeFindy(id: number) {
  const url = `https://findy-code.io/companies/${id}`
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

  const scriptData = doc.querySelector("#__NEXT_DATA__")
  if (!scriptData) {
    console.error(`Failed to find script data for ID ${id}`)
    return null
  }

  try {
    const jsonData = JSON.parse(scriptData.textContent!)
    if (!jsonData.props?.pageProps?.company?.company) {
      console.log(`No company data found for ID ${id}. Skipping...`)
      return null
    }

    const companyData = jsonData.props.pageProps.company.company

    return {
      id: id,
      companyName: companyData.name,
      location: companyData.location,
      description: companyData.description,
      establishedAt: companyData.establishedAt,
      president: companyData.president,
      url: companyData.url,
    }
  } catch (error) {
    console.error(`Error parsing JSON data for ID ${id}:`, error)
    return null
  }
}

async function upsertCompanyData(data: any) {
  try {
    await db.insert(findyTable).values(data).onConflictDoUpdate({
      target: findyTable.id,
      set: data,
    })
    console.log(`Data for ID ${data.id} inserted/updated successfully.`)
  } catch (error) {
    console.error(`Error upserting data for ID ${data.id}:`, error)
  }
}

async function main() {
  const startId = 2001
  const endId = 3000 // Adjust this value as needed

  for (let id = startId; id <= endId; id++) {
    const companyData = await scrapeFindy(id)

    if (companyData) {
      await upsertCompanyData(companyData)
    }

    // Rate limiting to avoid overloading the server
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  console.log("Done")
  Deno.exit(0)
}

main().catch(console.error)
