import { type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { NotFoundError } from "~/lib/utils/errors"
import { getAuthenticator } from "~/services/auth.server"
import { commitSession, getSession } from "~/services/session.server"
import { type AuthProvider, isValidAuthProvider } from "~/types/auth"

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  const provider = params["*"] as AuthProvider

  if (!isValidAuthProvider(provider)) {
    throw new NotFoundError()
  }

  const url = new URL(request.url)
  const redirectTo = url.searchParams.get("redirectTo") || "/dashboard"

  const authenticator = getAuthenticator(context)
  return authenticator.authenticate(provider, request, {
    successRedirect: redirectTo,
    failureRedirect: "/",
  })
}
