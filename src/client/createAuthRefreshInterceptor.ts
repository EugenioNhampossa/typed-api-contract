import type {
  ClientInterceptor,
  ClientResponse,
} from "./types/ClientInterceptor.js"

export class AuthUnauthorizedError extends Error {
  readonly response: ClientResponse

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
   * Defaults to `response.status === 401`.
   */
  isUnauthorized?: (response: ClientResponse) => boolean
  /**
   * Optional: set `Authorization` on every request (including retries).
   */
  getAccessToken?: () => string | Promise<string>
}

/**
 * Interceptor that refreshes auth on 401 and retries the original request once.
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
