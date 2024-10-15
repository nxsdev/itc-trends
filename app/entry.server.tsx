/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import type {
  ActionFunctionArgs,
  AppLoadContext,
  EntryContext,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { RemixServer } from "@remix-run/react"
// import * as Sentry from "@sentry/cloudflare"
import { isbot } from "isbot"
import { renderToReadableStream } from "react-dom/server"

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // biome-ignore lint/correctness/noUnusedVariables:
  loadContext: AppLoadContext
) {
  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        // Log streaming rendering errors from inside the shell
        console.error(error)
        responseStatusCode = 500
      },
    }
  )

  if (isbot(request.headers.get("user-agent") || "")) {
    await body.allReady
  }

  responseHeaders.set("Content-Type", "text/html")
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  })
}

// export function handleError(
//   error: unknown,
//   { request, params, context }: LoaderFunctionArgs | ActionFunctionArgs
// ) {
//   if (!request.signal.aborted) {
//     Sentry.captureException(error, {
//       contexts: {
//         request: {
//           url: request.url,
//           method: request.method,
//           headers: {
//             "user-agent": request.headers.get("User-Agent"),
//             referer: request.headers.get("Referer"),
//             "accept-language": request.headers.get("Accept-Language"),
//           },
//           cf: request.cf,
//         },
//         params,
//         customContext: context,
//       },
//       tags: {
//         route: new URL(request.url).pathname,
//         environment: context.cloudflare.env.ENVIRONMENT || "development",
//       },
//       user: {
//         ip_address:
//           request.headers.get("X-Forwarded-For") ||
//           request.headers.get("CF-Connecting-IP") ||
//           undefined,
//       },
//     })

//     console.error(error)
//   }
// }
