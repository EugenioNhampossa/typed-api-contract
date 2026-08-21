import type { AppRouter } from "../contract/index.js"
import { createClientTree } from "./createClientTree.js"
import type { InferClient } from "./types/InferClient.js"

interface InitClientOptions {
  baseUrl: string
}

/**
 * Builds a typed `fetch` client tree that mirrors `contract`.
 *
 * @param contract - Nested router created with `initContract().router(...)`.
 * @param options.baseUrl - API origin with no trailing slash, e.g. `https://api.example.com`.
 */
export function initClient<T extends AppRouter>(
  contract: T,
  options: InitClientOptions,
): InferClient<T> {
  return createClientTree(contract, options.baseUrl) as InferClient<T>
}
