import { AppLoadContext, json, redirect } from "@remix-run/cloudflare"

import { createSupabaseClient } from "./client.server"

export type AuthProvider = "github" | "twitter" | "google"

export async function signInWithProvider(request: Request, context: AppLoadContext, provider: AuthProvider) {
  console.log("request_provider", provider)
  const { supabase, headers } = createSupabaseClient(request, context)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: "http://localhost:5173/auth/callback" },
  })
  console.log(data)
  console.log(error)
  if (error) {
    // エラーの場合、JSONレスポンスを返す
    return json({ error: error.message }, { status: 401 })
  }

  if (data?.url) {
    console.log("data.url", data.url)
    // 成功した場合、OAuthプロバイダーのURLにリダイレクト
    return redirect(data.url, { headers })
  }

  // 予期せぬ状況の場合
  return json({ error: "Failed to initiate OAuth flow" }, { status: 500 })
}

export const signOut = async (request: Request, context: AppLoadContext, successRedirectPath = "/") => {
  const { supabase, headers } = createSupabaseClient(request, context)
  const { error } = await supabase.auth.signOut()

  if (!error) {
    throw redirect(successRedirectPath, { headers: headers })
  }

  return json({ error: error.message })
}
