import type { User } from "schema"

declare module "@remix-run/cloudflare" {
  interface SessionData {
    user: User | null
    "auth:redirect_to": string | null
  }
}
