// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },

    // This project intentionally keeps createServerFn modules under src/server/functions.
    // TanStack Start can safely consume these from client routes, but the broader **/server/**
    // deny rule used by the preset blocks them during build. Reset the client file rules to
    // TanStack's default so only explicit *.server.* files remain client-denied.
    importProtection: {
      client: {
        files: ["**/*.server.*"],
      },
    },
  },
});
