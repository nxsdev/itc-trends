import type { AppLoadContext } from "@remix-run/cloudflare"
import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr"
import { enhanceSupabaseJWT } from "./supabase-jwt-enhancer.server"

/**
 * 参考：https://github.com/aburio/remix-supabase/blob/main/app/lib/supabase/supabase.server.ts
 * 参考：https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=remix&queryGroups=package-manager&package-manager=pnpm&queryGroups=environment&environment=remix-loader
 */
export function createSupabaseClientWithoutJWT(request: Request, context: AppLoadContext) {
  const headers = new Headers()

  const supabase = createServerClient(
    context.cloudflare.env.SUPABASE_URL,
    context.cloudflare.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "")
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            headers.append("Set-Cookie", serializeCookieHeader(name, value, options))
          }
        },
      },
    }
  )

  return { supabase, headers }
}

export const createSupabaseClient = (request: Request, context: AppLoadContext) => {
  const { supabase, headers } = createSupabaseClientWithoutJWT(request, context)
  return {
    supabase: enhanceSupabaseJWT(supabase, context.cloudflare.env.SUPABASE_JWT_SECRET),
    headers,
  }
}
