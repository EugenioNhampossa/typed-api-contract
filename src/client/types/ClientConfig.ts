import type { ClientInterceptor } from "./ClientInterceptor.js"
import type { InitClientOptions } from "./InitClientOptions.js"
import type { QuerySerializer } from "./QuerySerializer.js"

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
  readonly signal?: AbortSignal
  readonly validateRequest: boolean
  readonly validateResponse: boolean
  readonly querySerializer: QuerySerializer
}
