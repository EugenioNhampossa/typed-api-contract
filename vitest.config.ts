import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "typed-api-contract/client": path.resolve(rootDir, "./src/client/index.ts"),
      "typed-api-contract/react-query": path.resolve(
        rootDir,
        "./src/react-query/index.ts",
      ),
      "typed-api-contract": path.resolve(rootDir, "./src/contract/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: [
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.test.ts",
      "tests/integration/**/*.test.tsx",
    ],
    typecheck: {
      enabled: false,
      tsconfig: "./tsconfig.vitest.json",
      include: ["tests/types/**/*.test-d.ts"],
    },
  },
})
