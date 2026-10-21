import type { AppRoute, HttpMethod } from "../../contract/index.js"

/**
 * Request about to be sent, or passed back into {@link ClientErrorContext.retry}.
 */
export interface ClientRequest {
  /** Absolute URL, including the serialized query string. */
  url: string

  /** HTTP method from the route. */
  method: HttpMethod

  /**
   * Headers for this attempt.
   *
   * Change them in `onRequest`, or return a new request. Interceptors run in
   * array order, and each receives the previous return value.
   */
  headers: Headers

  /** Encoded body, or `undefined` when the route sends none. */
  body: BodyInit | undefined

  /** Client signal combined with the per-call signal, when either is set. */
  signal: AbortSignal | undefined

  /** Route definition this call was built from. */
  route: AppRoute
}

/**
 * Mapped response, before Zod parsing and the declared-status check.
 */
export interface ClientResponse {
  /** HTTP status from `fetch`, or the status returned from `onError`. */
  status: number

  /** Parsed JSON body, or `undefined` when the body is empty. */
  body: unknown

  /** Response headers. */
  headers: Headers

  /**
   * Underlying `fetch` response.
   *
   * A response recovered from `onError` may use a synthetic `Response`.
   */
  raw: Response
}

/** Helpers passed to {@link ClientInterceptor.onError}. */
export interface ClientErrorContext {
  /**
   * Re-runs `onRequest` → fetch → `onResponse` once for this call.
   * Does not re-enter `onError`. The returned response is Zod-parsed by the client.
   */
  retry: (request?: ClientRequest) => Promise<ClientResponse>
}

/**
 * Hooks around a single route call.
 *
 * @remarks
 * Each call runs `onRequest` → fetch → map body → `onResponse` → Zod / status check.
 * `onResponse` sees the wire result, including undeclared statuses, before
 * {@link UnexpectedStatusError}. Zod still validates after the interceptor chain.
 *
 * `onError` runs when `fetch`, JSON parse, or status/Zod validation fails.
 * Throw to stop the chain, return a {@link ClientResponse} to recover, or call
 * `ctx.retry()` to re-issue the request once.
 */
export interface ClientInterceptor {
  /**
   * Adjust the request before `fetch`.
   *
   * @returns The request to send.
   */
  onRequest?(request: ClientRequest): ClientRequest | Promise<ClientRequest>

  /** Observe or replace the mapped response before Zod and the status check. */
  onResponse?(
    request: ClientRequest,
    response: ClientResponse,
  ): ClientResponse | Promise<ClientResponse>

  /**
   * Observe a failure, rethrow, return a `ClientResponse` to recover, or
   * `ctx.retry()` to re-issue the request once (e.g. after token refresh).
   */
  onError?(
    request: ClientRequest,
    error: unknown,
    ctx: ClientErrorContext,
  ): void | ClientResponse | Promise<void | ClientResponse>
}
