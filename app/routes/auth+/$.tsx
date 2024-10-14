import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare"
import invariant from "tiny-invariant"
import { NotFoundError } from "~/lib/utils/errors"
import { getAuthenticator } from "~/services/auth.server"
import { type AuthProvider, isValidAuthProvider } from "~/types/auth"

export async function loader() {
  return redirect("/")
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData()
  const provider = formData.get("provider") as AuthProvider
  const redirectTo = (formData.get("redirect_to") as string) || "/"

  if (!isValidAuthProvider(provider)) {
    throw new NotFoundError()
  }

  const authenticator = getAuthenticator(context)
  return authenticator.authenticate(provider, request, {
    successRedirect: redirectTo,
    failureRedirect: "/",
  })
}
