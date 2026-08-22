import type { AppRoute, HttpMethod } from "../../contract/index.js"

export interface ClientRequest {
  url: string
  method: HttpMethod
  headers: Headers
  body: string | undefined
  signal: AbortSignal | undefined
  route: AppRoute
}

export interface ClientResponse {
  status: number
  body: unknown
  headers: Headers
  raw: Response
}

export interface ClientInterceptor {
  onRequest?(request: ClientRequest): ClientRequest | Promise<ClientRequest>
  onResponse?(
    request: ClientRequest,
    response: ClientResponse,
  ): ClientResponse | Promise<ClientResponse>
  /**
   * Observe a failure, rethrow, or return a `ClientResponse` to recover.
   * A returned response is Zod-parsed once and is not sent through `onError` again.
   */
  onError?(
    request: ClientRequest,
    error: unknown,
  ): void | ClientResponse | Promise<void | ClientResponse>
}
