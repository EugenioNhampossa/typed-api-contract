import type {
  ClientErrorContext,
  ClientInterceptor,
  ClientRequest,
  ClientResponse,
} from "./types/ClientInterceptor.js"
import { isClientResponse } from "./isClientResponse.js"

/**
 * Runs `onError` hooks in array order.
 *
 * A hook that returns a `ClientResponse` recovers and stops the chain.
 * A hook that throws stops the chain. Otherwise the original error is rethrown.
 */
export async function runOnError(
  interceptors: readonly ClientInterceptor[],
  request: ClientRequest,
  error: unknown,
  ctx: ClientErrorContext,
): Promise<ClientResponse> {
  for (const interceptor of interceptors) {
    if (interceptor.onError === undefined) {
      continue
    }

    const result = await interceptor.onError(request, error, ctx)
    if (isClientResponse(result)) {
      return result
    }
  }

  throw error
}
