import { AppLoadContext } from "@remix-run/cloudflare"
import { SessionData } from "@remix-run/server-runtime"
import { and, eq } from "drizzle-orm"
import { Authenticator } from "remix-auth"
import { GitHubStrategy } from "remix-auth-github"
import { GoogleStrategy } from "remix-auth-google"
import { Twitter2Strategy } from "remix-auth-twitter"
import { type User, users } from "schema"
import { PlanType } from "~/constants/plan"
import { getSessionStorage } from "~/services/session.server"

let authenticator: Authenticator<SessionData["user"]> | null = null

export function getAuthenticator(context: AppLoadContext) {
  if (authenticator) return authenticator

  const sessionStorage = getSessionStorage(context)
  authenticator = new Authenticator<User>(sessionStorage, { sessionKey: "user" })

  authenticator.use(
    new GitHubStrategy(
      {
        clientId: context.cloudflare.env.GITHUB_CLIENT_ID,
        clientSecret: context.cloudflare.env.GITHUB_CLIENT_SECRET,
        redirectURI: `${context.cloudflare.env.APP_URL}/auth/github/callback`,
      },
      async ({ profile }) => {
        const { db } = context

        const existingUser = await db.query.users.findFirst({
          where: and(eq(users.email, profile.emails[0].value), eq(users.provider, "github")),
        })

        if (existingUser) {
          return existingUser
        }

        const newUser = await db
          .insert(users)
          .values({
            id: crypto.randomUUID(), // Generate a new UUID
            email: profile.emails[0].value || "",
            username: profile.displayName || "",
            fullName: `${profile.name.familyName} ${profile.name.givenName}` || "",
            avatarUrl: profile.photos[0].value || "",
            provider: "github",
            plan: "free", // Default plan
            isAdmin: false,
          })
          .returning()

        return newUser[0]
      }
    )
  )

  // Uncomment and adjust as needed for Google and Twitter strategies
  // authenticator.use(
  //   new GoogleStrategy(
  //     {
  //       clientID: env.GOOGLE_CLIENT_ID,
  //       clientSecret: env.GOOGLE_CLIENT_SECRET,
  //       callbackURL: `${env.AUTH_CALLBACK_BASE_URL}/auth/google/callback`,
  //     },
  //     async ({ profile }) => ({
  //       id: profile.id,
  //       email: profile.emails[0].value,
  //       name: profile.displayName,
  //       provider: "google" as const,
  //     })
  //   )
  // );

  // authenticator.use(
  //   new Twitter2Strategy(
  //     {
  //       clientId: env.TWITTER_CLIENT_ID,
  //       clientSecret: env.TWITTER_CLIENT_SECRET,
  //       callbackURL: `${env.AUTH_CALLBACK_BASE_URL}/auth/twitter/callback`,
  //     },
  //     async ({ profile }) => ({
  //       id: profile.id_str,
  //       email: profile.email,
  //       name: profile.name,
  //       provider: "twitter" as const,
  //     })
  //   )
  // );

  return authenticator
}

export function getAuthenticatedUser(request: Request, context: AppLoadContext) {
  const authenticator = getAuthenticator(context)
  return authenticator.isAuthenticated(request)
}
