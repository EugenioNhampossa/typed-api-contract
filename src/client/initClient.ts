import type { AppRouter } from "../contract/index.js"
import { createClientTree } from "./createClientTree.js"
import { normalizeClientConfig } from "./normalizeClientConfig.js"
import type { InferClient } from "./types/InferClient.js"
import type { InitClientOptions } from "./types/InitClientOptions.js"

/**
 * Builds a typed `fetch` client tree that mirrors `contract`.
 *
 * @param contract - Nested router created with `initContract().router(...)`.
 * @param options.baseUrl - API origin with no trailing slash, e.g. `https://api.example.com`.
 * @param options.headers - Static headers or a thunk resolved on every request.
 * @param options.fetch - Custom fetch implementation. Defaults to `globalThis.fetch`.
 * @param options.credentials - Forwarded to `fetch` as `RequestInit.credentials`.
 * @param options.interceptors - `onRequest` / `onResponse` / `onError` hooks around each call.
 * @param options.signal - Aborts every request; combined with per-call `signal` when both are set.
 * @param options.validateRequest - When true, Zod-parses `params` / `query` / `body` before fetch.
 */
export function initClient<T extends AppRouter>(
  contract: T,
  options: InitClientOptions,
): InferClient<T> {
  const config = normalizeClientConfig(options)
  return createClientTree(contract, config) as InferClient<T>
}
