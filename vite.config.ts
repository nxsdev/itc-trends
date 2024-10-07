import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev"
import { remixDevTools } from "remix-development-tools"
import { type DefineRoutesFunction, flatRoutes } from "remix-flat-routes"
import { defineConfig } from "vite"
import babel from "vite-plugin-babel"
import tsconfigPaths from "vite-tsconfig-paths"
import { getLoadContext } from "./load-context"

declare module "@remix-run/server-runtime" {
  interface Future {
    unstable_singleFetch: true // 👈 enable _types_ for single-fetch
  }
}

export default defineConfig({
  plugins: [
    // remixDevTools(),
    remixCloudflareDevProxy({ getLoadContext }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_singleFetch: true,
        unstable_lazyRouteDiscovery: true,
        unstable_optimizeDeps: true,
      },
      // Flat routes configuration
      routes: async (defineRoutes: DefineRoutesFunction) => {
        return flatRoutes("routes", defineRoutes, {
          // Optional: You can add any additional options for flatRoutes here
        })
      },
      // Ignore all files in routes folder to prevent
      // default remix convention from picking up routes
      ignoredRouteFiles: ["**/*"],
    }),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ["@babel/preset-typescript"], // if you use TypeScript
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tsconfigPaths(),
  ],
})
