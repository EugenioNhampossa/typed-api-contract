import { isRecord } from "../shared/isRecord.js"
import { serializeQuery } from "./serializeQuery.js"
import type { ClientConfig } from "./types/ClientConfig.js"
import type { InitClientOptions } from "./types/InitClientOptions.js"

/**
 * Fills in client defaults so route callers always receive a complete config.
 *
 * Default `fetch` reads `globalThis.fetch` at call time so polyfills and
 * test interceptors applied after `initClient` still take effect.
 */
export function normalizeClientConfig(options: InitClientOptions): ClientConfig {
  return {
    baseUrl: options.baseUrl,
    fetch: options.fetch ?? ((input, init) => globalThis.fetch(input, init)),
    headers: options.headers,
    credentials: options.credentials,
    interceptors: options.interceptors ?? [],
    signal: options.signal,
    validateRequest: options.validateRequest ?? false,
    validateResponse: options.validateResponse ?? false,
    querySerializer:
      options.querySerializer ??
      ((query) => (isRecord(query) ? serializeQuery(query) : "")),
  }
}
