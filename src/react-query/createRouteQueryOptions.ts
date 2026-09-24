import { queryOptions } from "@tanstack/react-query"
import type { ClientCallArgs } from "../client/index.js"
import { combineAbortSignals } from "../client/combineAbortSignals.js"
import type { AppRoute, InferResponses } from "../contract/index.js"
import { buildQueryKey } from "./buildQueryKey.js"
import { callClientRoute } from "./callClientRoute.js"
import type { ContractClientError } from "./types/ContractClientError.js"

/**
 * Builds TanStack `queryOptions` for a GET route (shared by hooks and prefetch).
 */
export function createRouteQueryOptions<R extends AppRoute>(
  client: unknown,
  routePath: readonly string[],
) {
  return (args: ClientCallArgs<R>) =>
    queryOptions<InferResponses<R>, ContractClientError>({
      queryKey: buildQueryKey(routePath, args),
      queryFn: ({ signal }) =>
        callClientRoute(client, routePath, {
          ...args,
          signal: combineAbortSignals(args.signal, signal),
        }) as Promise<InferResponses<R>>,
    })
}
