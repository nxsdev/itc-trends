import type { MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
// import { ROUTE_PATH as DASHBOARD_PATH } from "~/routes/dashboard+/_layout"
import { ExternalLink, HelpCircle } from "lucide-react"
// import { siteConfig } from "#app/utils/constants/brand"
import { GenericErrorBoundary } from "~/components/misc/error-boundary"
import { buttonStyles } from "~/components/ui/button"

export const meta: MetaFunction = () => {
  return [{ title: "ITC Trends - 404 Not Found!" }]
}

export async function loader() {
  throw new Response("Not found", { status: 404 })
}

export default function NotFound() {
  // Due to the loader, this component will never be rendered,
  // but as a good practice, ErrorBoundary will be returned.
  return <ErrorBoundary />
}

export function ErrorBoundary() {
  return (
    <GenericErrorBoundary
      statusHandlers={{
        404: () => (
          <div className="flex h-screen w-full flex-col items-center justify-center gap-8 rounded-md px-6">
            <div className=" flex size-16 items-center justify-center rounded-2xl border border-border-strong">
              <HelpCircle className="size-8 stroke-[1.5px]" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="font-medium text-foreground text-lg">なにかをお探しですか？🔍</p>
              <p className="w-80 text-center text-foreground-lighter text-sm">
                お探しのページが見つかりませんでした。
              </p>
            </div>
            <Link
              to="/"
              prefetch="intent"
              className={`${buttonStyles({ variant: "primary", size: "md" })} gap-2`}
            >
              <span className="font-medium text-sm">ホームに戻る</span>
            </Link>
          </div>
        ),
      }}
    />
  )
}
