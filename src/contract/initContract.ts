import type { AppRouter } from "./types/AppRouter.js"

interface ContractInit {
  router<const T extends AppRouter>(routes: T): T
}

/**
 * Returns a helper that constrains a nested route tree to `AppRouter`
 * while preserving literal keys via `const` type parameters.
 */
export function initContract(): ContractInit {
  return {
    router: <const T extends AppRouter>(routes: T): T => routes,
  }
}
