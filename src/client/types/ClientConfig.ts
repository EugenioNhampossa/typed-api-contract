import type { ClientInterceptor } from "./ClientInterceptor.js"
import type { InitClientOptions } from "./InitClientOptions.js"

/**
 * Normalised config threaded through the client tree.
 *
 * Built from `InitClientOptions` by `normalizeClientConfig`.
 */
export interface ClientConfig {
  readonly baseUrl: string
  readonly fetch: typeof fetch
  readonly headers?: InitClientOptions["headers"]
  readonly credentials?: RequestCredentials
  readonly interceptors: readonly ClientInterceptor[]
}
