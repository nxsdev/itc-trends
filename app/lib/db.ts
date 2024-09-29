import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "../../schema"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL が設定されていません")
}

export const queryClient = postgres(databaseUrl)
export const db = drizzle(queryClient, { schema })
