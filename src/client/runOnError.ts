import type {
  ClientInterceptor,
  ClientRequest,
} from "./types/ClientInterceptor.js"

/**
 * Runs `onError` hooks in array order, then rethrows the original error.
 *
 * A hook that throws stops the chain. Returned values are ignored.
 */
export async function runOnError(
  interceptors: readonly ClientInterceptor[],
  request: ClientRequest,
  error: unknown,
): Promise<never> {
  for (const interceptor of interceptors) {
    if (interceptor.onError === undefined) {
      continue
    }

    await interceptor.onError(request, error)
  }

  throw error
}
