import type { ClientInterceptor } from "./ClientInterceptor.js"
import type { QuerySerializer } from "./QuerySerializer.js"

/**
 * Options passed to `initClient`.
 *
 * `baseUrl` is the API origin with no trailing slash, e.g. `https://api.example.com`.
 */
export interface InitClientOptions {
  baseUrl: string
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>)
  fetch?: typeof fetch
  credentials?: RequestCredentials
  interceptors?: readonly ClientInterceptor[]
  signal?: AbortSignal
  validateRequest?: boolean
  /**
   * Serializes `query` into a search string (including `?`).
   * Defaults to scalar `serializeQuery`. Use `serializeQueryRepeat` or
   * `serializeQueryBrackets` for array filters.
   */
  querySerializer?: QuerySerializer
}
