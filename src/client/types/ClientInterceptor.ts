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
   * Observe a failure and rethrow. Returning a response to recover is not
   * supported yet; the original error is thrown after the chain finishes.
   */
  onError?(request: ClientRequest, error: unknown): void | Promise<void>
}
