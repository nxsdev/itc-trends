import type { AppLoadContext } from "@remix-run/cloudflare"
import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import type { PlatformProxy } from "wrangler"
import * as schema from "./schema"

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare
    db: PostgresJsDatabase<typeof schema>
  }
}

type GetLoadContext = (args: {
  request: Request
  context: {
    cloudflare: Cloudflare
  }
}) => Promise<AppLoadContext>

export const getLoadContext: GetLoadContext = async ({ context }) => {
  const db = drizzle(postgres(context.cloudflare.env.DATABASE_URL), { schema })
  return {
    cloudflare: context.cloudflare,
    db: db,
  }
}
