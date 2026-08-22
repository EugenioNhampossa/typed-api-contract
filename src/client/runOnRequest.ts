import type {
  ClientInterceptor,
  ClientRequest,
} from "./types/ClientInterceptor.js"

/**
 * Runs `onRequest` hooks in array order, threading the returned request.
 */
export async function runOnRequest(
  interceptors: readonly ClientInterceptor[],
  request: ClientRequest,
): Promise<ClientRequest> {
  let current = request

  for (const interceptor of interceptors) {
    if (interceptor.onRequest === undefined) {
      continue
    }

    current = await interceptor.onRequest(current)
  }

  return current
}
