import type { InferClient } from "../client/index.js"
import type { AppRouter } from "../contract/index.js"
import { createQueryOptionsTree } from "./createQueryOptionsTree.js"
import type { InferQueryOptions } from "./types/InferQueryOptions.js"

/**
 * Builds a typed TanStack Query options tree that mirrors `contract`.
 *
 * Use with `useQuery(options.posts.list(args))`, `prefetchQuery`, and hydration.
 * GET routes with `infinite` also expose `.infinite(args)`.
 */
export function initQueryOptions<T extends AppRouter>(
  contract: T,
  client: InferClient<T>,
): InferQueryOptions<T> {
  return createQueryOptionsTree(contract, client) as InferQueryOptions<T>
}
