import { type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { NotFoundError } from "~/lib/utils/errors"
import { getAuthenticator } from "~/services/auth.server"
import { type AuthProvider, isValidAuthProvider } from "~/types/auth"

export const loader = async ({ request, context, params }: LoaderFunctionArgs) => {
  console.log("Callback loader triggered")
  console.log("Request URL:", request.url)
  console.log("Params:", params)

  // const provider = params["*"] as AuthProvider

  // if (!isValidAuthProvider(provider)) {
  //   console.log("Invalid provider:", provider)
  //   throw new NotFoundError()
  // }

  // console.log("Valid provider:", provider)

  const authenticator = getAuthenticator(context)
  try {
    const result = await authenticator.authenticate("github", request, {
      successRedirect: "/search",
      failureRedirect: "/search",
    })
    console.log("Authentication result:", result)
    return result
  } catch (error) {
    console.error("Authentication error:", error)
    throw error
  }
}
