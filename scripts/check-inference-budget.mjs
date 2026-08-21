import { execSync } from "node:child_process"
import process from "node:process"

const INFERENCE_BUDGET_MS = 15_000

const startedAt = Date.now()

try {
  execSync("pnpm exec tsc --noEmit --incremental false -p tsconfig.vitest.json", {
    stdio: "inherit",
  })
} catch {
  process.exit(1)
}

const elapsedMs = Date.now() - startedAt

if (elapsedMs > INFERENCE_BUDGET_MS) {
  console.error(
    `Inference budget exceeded: ${elapsedMs}ms (limit ${INFERENCE_BUDGET_MS}ms)`,
  )
  process.exit(1)
}

console.log(
  `Inference budget ok: ${elapsedMs}ms (limit ${INFERENCE_BUDGET_MS}ms)`,
)
