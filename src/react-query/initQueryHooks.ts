import type { InferClient } from "../client/index.js"
import type { AppRouter } from "../contract/index.js"
import { createQueryHooksTree } from "./createQueryHooksTree.js"
import type { InferQueryHooks } from "./types/InferQueryHooks.js"

/**
 * Builds a typed TanStack Query hook tree that mirrors `contract`.
 *
 * GET routes become `useQuery` hooks. All other methods become `useMutation` hooks.
 *
 * @param contract - The same router passed to `initClient`.
 * @param client - Client created with `initClient(contract, options)`.
 */
export function initQueryHooks<T extends AppRouter>(
  contract: T,
  client: InferClient<T>,
): InferQueryHooks<T> {
  return createQueryHooksTree(contract, client) as InferQueryHooks<T>
}
