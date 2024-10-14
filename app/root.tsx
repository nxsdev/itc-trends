import "./tailwind.css"

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react"
import { clsx } from "clsx"
import { Provider, createStore } from "jotai"
import { PreventFlashOnWrongTheme, Theme, ThemeProvider, useTheme } from "remix-themes"
import { envAtom } from "~/atoms/env-atom"
import { userAtom } from "~/atoms/user-atom"
import { Header } from "~/components/layout/header"
import { Toaster } from "~/components/ui/sonner"
import Footer from "./components/layout/footer"
import { getAuthenticatedUser } from "./services/auth.server"
import { themeSessionResolver } from "./sessions.server"

// Return the theme from the session storage using the loader
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request)
  const user = await getAuthenticatedUser(request, context)

  return {
    theme: getTheme(),
    user,
    ENV: {
      APP_URL: context.cloudflare.env.APP_URL,
    },
  }
}

// `themeAction` is the action name that's used to change the theme in the session storage.
export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>()
  const { user } = useLoaderData<typeof loader>()
  const store = createStore()
  store.set(userAtom, user ?? null)
  store.set(envAtom, data.ENV)

  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <Provider store={store}>
        <App />
      </Provider>
      <App />
    </ThemeProvider>
  )
}

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "ITC Trends | IT企業の社員数推移を可視化" },
    {
      name: "description",
      content:
        "IT/Webエンジニアに特化した企業検索サイトです。企業の社員数推移をグラフで可視化し、成長性の高いスタートアップや優良企業を見つけることができます。",
    },
    {
      property: "og:title",
      content: "ITC Trends | IT企業の社員数推移を可視化",
    },
    {
      property: "og:description",
      content:
        "IT企業の社員数推移をグラフで可視化し、成長性の高いスタートアップや優良企業を見つけることができます。",
    },
    { property: "og:image", content: "" },
    { property: "og:url", content: "https://itc-trends.com" },
  ]
}

export function App() {
  const data = useLoaderData<typeof loader>()
  const [theme, _, { definedBy }] = useTheme()

  const isSystemTheme = definedBy === "SYSTEM"

  return (
    <html lang="ja" className={clsx(theme)}>
      <head>
        <meta httpEquiv="Content-Type" content="text/html;charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="og:site_name" content="ITC Trends" />
        <meta name="og:type" content="website" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body className="min-h-screen antialiased">
        <Header user={data.user} />
        <Outlet />
        <Toaster />
        <Footer theme={!isSystemTheme && theme === Theme.LIGHT ? Theme.LIGHT : Theme.DARK} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
