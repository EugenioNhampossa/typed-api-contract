import type {
  ClientInterceptor,
  ClientRequest,
  ClientResponse,
} from "./types/ClientInterceptor.js"

/**
 * Runs `onResponse` hooks in array order, threading the returned response.
 */
export async function runOnResponse(
  interceptors: readonly ClientInterceptor[],
  request: ClientRequest,
  response: ClientResponse,
): Promise<ClientResponse> {
  let current = response

  for (const interceptor of interceptors) {
    if (interceptor.onResponse === undefined) {
      continue
    }

    current = await interceptor.onResponse(request, current)
  }

  return current
}
