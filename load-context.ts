import type { PlatformProxy } from "wrangler";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema"
import postgres from "postgres";

// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate types for those bindings
// into the global `Env` interface.
// Need this empty interface so that typechecking passes
// even if no `wrangler.toml` exists.
interface Env {
  APP_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_JWT_SECRET: string;
  DATABASE_URL: string;
}


type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    db: PostgresJsDatabase<typeof schema>;
  }
}

type GetLoadContext = (args: {
  request: Request;
  context: {
    cloudflare: Cloudflare;
  };
}) => Promise<AppLoadContext>;

export const getLoadContext: GetLoadContext = async ({ context }) => {
  const db = drizzle(postgres(
    context.cloudflare.env.DATABASE_URL
  ), { schema })
  return {
    cloudflare: context.cloudflare,
    db: db,
  };
};