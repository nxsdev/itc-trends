import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"
import { createSupabaseClientWithoutJWT } from "~/lib/supabase/client.server"

export async function loader({ request, context }: LoaderFunctionArgs) {
  console.log("context", context)
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  if (!code) {
    return new Response("No code provided", { status: 400 })
  }

  const { supabase, headers } = createSupabaseClientWithoutJWT(request, context)
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log("data", data)
    console.log("error", error)
  } catch (e) {
    console.error(e)
  }
  // if (error) {
  //   console.error(error)
  // }
  return redirect("/", { headers })
}
