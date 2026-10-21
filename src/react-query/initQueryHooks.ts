import type { InferClient } from "../client/index.js"
import type { AppRouter } from "../contract/index.js"
import { createQueryHooksTree } from "./createQueryHooksTree.js"
import type { InferQueryHooks } from "./types/InferQueryHooks.js"

/**
 * Builds a typed TanStack Query hook tree that mirrors `contract`.
 *
 * GET routes become `useQuery` hooks. All other methods become `useMutation` hooks.
 * GET routes with `infinite` also expose `.infinite`.
 *
 * @param contract - The same router passed to `initClient`.
 * @param client - Client created with `initClient(contract, options)`.
 * @returns Nested hooks matching `contract`. See {@link InferQueryHooks}.
 *
 * @remarks
 * Query hooks forward TanStack Query's abort signal, so unmounting a query
 * cancels the in-flight `fetch`. That signal is combined with a per-call `signal`.
 *
 * @example
 * ```ts
 * import { initQueryHooks } from "typed-api-contract/react-query"
 *
 * const postsHooks = initQueryHooks(postsContract, postsClient)
 *
 * const posts = postsHooks.posts.list({})
 * const createPost = postsHooks.posts.create()
 * ```
 */
export function initQueryHooks<T extends AppRouter>(
  contract: T,
  client: InferClient<T>,
): InferQueryHooks<T> {
  return createQueryHooksTree(contract, client) as InferQueryHooks<T>
}
