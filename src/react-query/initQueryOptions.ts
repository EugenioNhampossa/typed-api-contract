import type { InferClient } from "../client/index.js"
import type { AppRouter } from "../contract/index.js"
import { createQueryOptionsTree } from "./createQueryOptionsTree.js"
import type { InferQueryOptions } from "./types/InferQueryOptions.js"

/**
 * Builds a typed TanStack Query options tree that mirrors `contract`.
 *
 * Use with `useQuery`, `prefetchQuery`, and hydration.
 * GET routes with `infinite` also expose `.infinite(args)`.
 *
 * @param contract - The same router passed to `initClient`.
 * @param client - Client created with `initClient(contract, options)`.
 * @returns Nested option factories matching `contract`. See {@link InferQueryOptions}.
 *
 * @example
 * ```ts
 * import { useQuery } from "@tanstack/react-query"
 * import { initQueryOptions } from "typed-api-contract/react-query"
 *
 * const options = initQueryOptions(postsContract, postsClient)
 *
 * useQuery(options.posts.list({ query: {} }))
 * await queryClient.prefetchQuery(options.posts.getById({ params: { id } }))
 * options.posts.list.infinite({ query: {} })
 * ```
 */
export function initQueryOptions<T extends AppRouter>(
  contract: T,
  client: InferClient<T>,
): InferQueryOptions<T> {
  return createQueryOptionsTree(contract, client) as InferQueryOptions<T>
}
