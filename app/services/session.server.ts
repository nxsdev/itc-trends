import { createCookieSessionStorage } from "@remix-run/cloudflare"
import type {
  AppLoadContext,
  CookieParseOptions,
  CookieSerializeOptions,
  Session,
  SessionData,
} from "@remix-run/cloudflare"

let sessionStorage: ReturnType<typeof createCookieSessionStorage> | null = null

export function getSessionStorage(context: AppLoadContext) {
  if (sessionStorage) return sessionStorage

  sessionStorage = createCookieSessionStorage({
    cookie: {
      name: "_session",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [context.cloudflare.env.SESSION_SECRET],
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30日間
    },
  })

  return sessionStorage
}

export const getSession = (
  context: AppLoadContext,
  cookieHeader?: string | null,
  options?: CookieParseOptions
): Promise<Session<SessionData>> => getSessionStorage(context).getSession(cookieHeader, options)

export const commitSession = (
  context: AppLoadContext,
  session: Session,
  options?: CookieSerializeOptions
) => getSessionStorage(context).commitSession(session, options)

export const destroySession = (
  context: AppLoadContext,
  session: Session,
  options?: CookieSerializeOptions
) => getSessionStorage(context).destroySession(session, options)
