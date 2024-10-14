export const AUTH_PROVIDERS = {
  GITHUB: "github",
  GOOGLE: "google",
  TWITTER: "twitter",
} as const satisfies Readonly<Record<string, string>>

export type AuthProvider = (typeof AUTH_PROVIDERS)[keyof typeof AUTH_PROVIDERS]

export function isValidAuthProvider(value: unknown): value is AuthProvider {
  return typeof value === "string" && Object.values(AUTH_PROVIDERS).includes(value as AuthProvider)
}
