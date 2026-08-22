import type { ClientRequest } from "./types/ClientInterceptor.js"

/**
 * Maps an intercepted request plus client credentials into `fetch` init.
 */
export function toFetchInit(
  request: ClientRequest,
  credentials: RequestCredentials | undefined,
): RequestInit {
  return {
    method: request.method,
    headers: request.headers,
    body: request.body,
    signal: request.signal,
    credentials,
  }
}
