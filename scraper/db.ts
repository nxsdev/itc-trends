import { drizzle } from "npm:drizzle-orm/postgres-js"
import postgres from "npm:postgres"
import * as schema from "./schema.ts"
import "https://deno.land/std@0.203.0/dotenv/load.ts"

const databaseUrl = Deno.env.get("DATABASE_URL")
if (!databaseUrl) {
  throw new Error("DATABASE_URL が設定されていません")
}

export const queryClient = postgres(databaseUrl)
export const db = drizzle(queryClient, { schema })
