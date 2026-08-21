import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query"
import type { AppRoute, InferClientArgs, InferResponses } from "../contract/index.js"
import { buildQueryKey } from "./buildQueryKey.js"
import { callClientRoute } from "./callClientRoute.js"

export function createQueryHook<R extends AppRoute>(
  client: unknown,
  routePath: readonly string[],
): <TData = InferResponses<R>>(
  args: InferClientArgs<R>,
  options?: Omit<
    UseQueryOptions<InferResponses<R>, Error, TData>,
    "queryKey" | "queryFn"
  >,
) => UseQueryResult<TData, Error> {
  return function useContractQuery(args, options) {
    return useQuery({
      ...options,
      queryKey: buildQueryKey(routePath, args),
      queryFn: () =>
        callClientRoute(client, routePath, args) as Promise<InferResponses<R>>,
    })
  }
}
