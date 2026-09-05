// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath, URL } from "node:url";

const rpcDir = fileURLToPath(new URL("./src/rpc", import.meta.url));

export default defineConfig({
  vite: {
    server: {
      allowedHosts: [".monkeycode-ai.live"],
    },
    resolve: {
      alias: [{ find: "@/server/functions", replacement: rpcDir }],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },

    // Client code must not import raw files from src/server directly. We remap all
    // "@/server/functions/*" imports to client-safe RPC wrappers under src/rpc/*.
    // Keep TanStack's client deny rules at their default narrow scope.
    importProtection: {
      client: {
        files: ["**/*.server.*"],
      },
    },
  },
});
