import type { AppRouter } from "./types/AppRouter.js"

/**
 * Helper returned by {@link initContract}.
 */
interface ContractInit {
  /**
   * Checks `routes` against {@link AppRouter} and returns that same tree.
   *
   * The `const` type parameter keeps literal route keys, paths, and methods
   * so clients and hooks can infer them.
   *
   * @param routes - Nested route tree. Each leaf is an {@link AppRoute}.
   * @returns The same `routes` value, with its literal type preserved.
   */
  router<const T extends AppRouter>(routes: T): T
}

/**
 * Returns a helper that constrains a nested route tree to {@link AppRouter}
 * while preserving literal keys via `const` type parameters.
 *
 * @returns A {@link ContractInit} whose `router` method returns the tree unchanged.
 *
 * @example
 * ```ts
 * import { HTTP_METHOD, initContract } from "typed-api-contract"
 * import { z } from "zod"
 *
 * const postsContract = initContract().router({
 *   list: {
 *     method: HTTP_METHOD.GET,
 *     path: "/posts",
 *     responses: {
 *       200: z.array(z.object({ id: z.string(), title: z.string() })),
 *     },
 *   },
 * })
 * ```
 */
export function initContract(): ContractInit {
  return {
    router: <const T extends AppRouter>(routes: T): T => routes,
  }
}
