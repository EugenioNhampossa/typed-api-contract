import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query"
import type { ClientCallArgs } from "../client/index.js"
import { combineAbortSignals } from "../client/combineAbortSignals.js"
import type { AppRoute, InferResponses } from "../contract/index.js"
import { buildQueryKey } from "./buildQueryKey.js"
import { callClientRoute } from "./callClientRoute.js"

export function createQueryHook<R extends AppRoute>(
  client: unknown,
  routePath: readonly string[],
): <TData = InferResponses<R>>(
  args: ClientCallArgs<R>,
  options?: Omit<
    UseQueryOptions<InferResponses<R>, Error, TData>,
    "queryKey" | "queryFn"
  >,
) => UseQueryResult<TData, Error> {
  return function useContractQuery(args, options) {
    return useQuery({
      ...options,
      queryKey: buildQueryKey(routePath, args),
      queryFn: ({ signal }) =>
        callClientRoute(client, routePath, {
          ...args,
          signal: combineAbortSignals(args.signal, signal),
        }) as Promise<InferResponses<R>>,
    })
  }
}
