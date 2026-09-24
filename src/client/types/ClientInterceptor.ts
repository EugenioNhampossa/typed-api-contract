import type { AppRoute, HttpMethod } from "../../contract/index.js"

export interface ClientRequest {
  url: string
  method: HttpMethod
  headers: Headers
  body: BodyInit | undefined
  signal: AbortSignal | undefined
  route: AppRoute
}

export interface ClientResponse {
  status: number
  body: unknown
  headers: Headers
  raw: Response
}

export interface ClientErrorContext {
  /**
   * Re-runs `onRequest` → fetch → `onResponse` once for this call.
   * Does not re-enter `onError`. The returned response is Zod-parsed by the client.
   */
  retry: (request?: ClientRequest) => Promise<ClientResponse>
}

export interface ClientInterceptor {
  onRequest?(request: ClientRequest): ClientRequest | Promise<ClientRequest>
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
