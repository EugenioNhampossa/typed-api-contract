import type { AppRouter } from "../contract/index.js"
import { createClientTree } from "./createClientTree.js"
import { normalizeClientConfig } from "./normalizeClientConfig.js"
import type { InferClient } from "./types/InferClient.js"
import type { InitClientOptions } from "./types/InitClientOptions.js"

/**
 * Builds a typed `fetch` client tree that mirrors `contract`.
 *
 * @param contract - Nested router created with `initContract().router(...)`.
 * @param options - Base URL and transport settings. See {@link InitClientOptions}.
 * @returns Nested callers matching `contract`. See {@link InferClient}.
 *
 * @throws {UnexpectedStatusError} When a route caller receives a status that has no response schema.
 * @throws {ZodError} When `validateResponse` is set and a response body fails its schema, or when `validateRequest` is set and `params`, `query`, or `body` fail theirs.
 *
 * @remarks
 * Those errors are thrown by the route caller, not by `initClient` itself.
 * `initClient` does throw `Error` while building the tree when a path's
 * `:param` placeholders and `pathParams` keys disagree.
 *
 * @example
 * ```ts
 * import { initClient } from "typed-api-contract/client"
 *
 * const postsClient = initClient(postsContract, {
 *   baseUrl: "https://api.example.com",
 * })
 *
 * const page = await postsClient.list({})
 * ```
 *
 * @see {@link InitClientOptions}
 * @see {@link UnexpectedStatusError}
 * @see {@link createAuthRefreshInterceptor}
 */
export function initClient<T extends AppRouter>(
  contract: T,
  options: InitClientOptions,
): InferClient<T> {
  const config = normalizeClientConfig(options)
  return createClientTree(contract, config) as InferClient<T>
}
