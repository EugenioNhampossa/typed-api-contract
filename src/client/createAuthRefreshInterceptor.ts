import type {
  ClientInterceptor,
  ClientResponse,
} from "./types/ClientInterceptor.js"

/**
 * Thrown by {@link createAuthRefreshInterceptor} when a response is unauthorized.
 *
 * The interceptor catches the first one, refreshes, and retries. The caller sees
 * this error when that retry is still unauthorized.
 */
export class AuthUnauthorizedError extends Error {
  /** Unauthorized response that triggered the refresh. */
  readonly response: ClientResponse

  /**
   * @param response - Unauthorized response that triggered the refresh.
   */
  constructor(response: ClientResponse) {
    super(`Unauthorized status ${response.status}`)
    this.name = "AuthUnauthorizedError"
    this.response = response
  }
}

export interface CreateAuthRefreshInterceptorOptions {
  /**
   * Refresh credentials (e.g. rotate access token). Shared across concurrent 401s.
   */
  refresh: () => Promise<void>
  /**
   * Returns true when the response should trigger a refresh.
   *
   * @defaultValue `response.status === 401`
   */
  isUnauthorized?: (response: ClientResponse) => boolean
  /**
   * Optional: set `Authorization` on every request (including retries).
   */
  getAccessToken?: () => string | Promise<string>
}

/**
 * Returns an interceptor that refreshes auth on 401 and retries the request once.
 *
 * Concurrent 401s share one `refresh` call. A second 401 is not retried.
 *
 * @param options - Refresh callback, plus optional token and status checks.
 * @returns A {@link ClientInterceptor} to pass to `initClient`.
 *
 * @example
 * ```ts
 * import { createAuthRefreshInterceptor, initClient } from "typed-api-contract/client"
 *
 * const postsClient = initClient(postsContract, {
 *   baseUrl: "https://api.example.com",
 *   interceptors: [
 *     createAuthRefreshInterceptor({
 *       getAccessToken: () => accessToken,
 *       refresh: async () => {
 *         accessToken = await refreshAccessToken()
 *       },
 *     }),
 *   ],
 * })
 * ```
 */
export function createAuthRefreshInterceptor(
  options: CreateAuthRefreshInterceptorOptions,
): ClientInterceptor {
  const isUnauthorized = options.isUnauthorized ?? defaultIsUnauthorized
  let refreshPromise: Promise<void> | undefined

  async function refreshOnce(): Promise<void> {
    if (refreshPromise === undefined) {
      refreshPromise = options.refresh().finally(() => {
        refreshPromise = undefined
      })
    }

    await refreshPromise
  }

  return {
    async onRequest(request) {
      if (options.getAccessToken === undefined) {
        return request
      }

      const token = await options.getAccessToken()
      request.headers.set("Authorization", `Bearer ${token}`)
      return request
    },
    onResponse(_request, response) {
      if (isUnauthorized(response)) {
        throw new AuthUnauthorizedError(response)
      }

      return response
    },
    async onError(request, error, ctx) {
      if (!(error instanceof AuthUnauthorizedError)) {
        throw error
      }

      await refreshOnce()
      return ctx.retry(request)
    },
  }
}

function defaultIsUnauthorized(response: ClientResponse): boolean {
  return response.status === 401
}
