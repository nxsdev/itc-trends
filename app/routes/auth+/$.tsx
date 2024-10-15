import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare"
import invariant from "tiny-invariant"
import { NotFoundError } from "~/lib/utils/errors"
import { getAuthenticator } from "~/services/auth.server"
import { type AuthProvider, isValidAuthProvider } from "~/types/auth"

export async function loader() {
  return redirect("/")
}

export async function action({ request, context, params }: ActionFunctionArgs) {
  const provider = params["*"] as AuthProvider
  console.log(request.url)
  console.log("provider", provider)

  if (!isValidAuthProvider(provider)) {
    throw new NotFoundError()
  }

  // リクエストをクローンして formData を取得
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()
  const redirectTo = (formData.get("redirectTo") as string) || "/"

  const authenticator = getAuthenticator(context)
  return authenticator.authenticate(provider, request)
}
