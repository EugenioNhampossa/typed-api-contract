import type { ClientInterceptor } from "./ClientInterceptor.js"
import type { QuerySerializer } from "./QuerySerializer.js"

/**
 * Options passed to `initClient`.
 */
export interface InitClientOptions {
  /**
   * API origin with no trailing slash, for example `https://api.example.com`.
   */
  baseUrl: string

  /**
   * Static headers, or a thunk (sync or async) resolved on every request.
   *
   * Merge order, later wins: JSON `Content-Type` when a JSON body is sent,
   * these headers, per-call `headers`, then `onRequest` mutations.
   * Multipart bodies never set `Content-Type`.
   */
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>)

  /**
   * Custom `fetch` implementation.
   *
   * @defaultValue `globalThis.fetch`, read at call time
   */
  fetch?: typeof fetch

  /** Forwarded to `fetch` as `RequestInit.credentials`. */
  credentials?: RequestCredentials

  /**
   * `onRequest` / `onResponse` / `onError` hooks around each call.
   *
   * @defaultValue `[]`
   * @see {@link ClientInterceptor}
   */
  interceptors?: readonly ClientInterceptor[]

  /**
   * Aborts every request.
   *
   * Combined with a per-call `signal` when both are set.
   */
  signal?: AbortSignal

  /**
   * When `true`, Zod-parses `params`, `query`, and `body` before `fetch`.
   *
   * @defaultValue `false`
   */
  validateRequest?: boolean

  /**
   * When `true`, Zod-parses the response body for the status that came back.
   *
   * The body stays typed from the status schema either way. A status with no
   * schema still throws `UnexpectedStatusError`.
   *
   * @defaultValue `false`
   */
  validateResponse?: boolean

  /**
   * Serializes `query` into a search string, including the leading `?`.
   *
   * @defaultValue {@link serializeQuery}
   * @see {@link serializeQueryRepeat}
   * @see {@link serializeQueryBrackets}
   */
  querySerializer?: QuerySerializer
}
