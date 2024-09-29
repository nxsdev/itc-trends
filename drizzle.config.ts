import { type Config, defineConfig } from "drizzle-kit"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL が設定されていません")
}

export default defineConfig({
  dbCredentials: {
    url: databaseUrl,
  },
  dialect: "postgresql",
  schema: "./schema.ts",
  out: "./drizzle",
  // supabase authのテーブルは作成しない
  schemaFilter: ["public"],
}) satisfies Config
