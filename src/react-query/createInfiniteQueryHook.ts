import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query"
import type { ClientCallArgs } from "../client/index.js"
import type { AppRoute, InferResponses } from "../contract/index.js"
import { createRouteInfiniteQueryOptions } from "./createRouteInfiniteQueryOptions.js"
import type { ContractClientError } from "./types/ContractClientError.js"

export function createInfiniteQueryHook<R extends AppRoute>(
  client: unknown,
  routePath: readonly string[],
  route: R,
): (
  args: ClientCallArgs<R>,
  options?: Record<string, unknown>,
) => UseInfiniteQueryResult<
  InfiniteData<InferResponses<R>>,
  ContractClientError
> {
  const getOptions = createRouteInfiniteQueryOptions(client, routePath, route)

  return function useContractInfiniteQuery(args, options) {
    const routeOptions = getOptions(args)
    return useInfiniteQuery({
      ...options,
      queryKey: routeOptions.queryKey,
      queryFn: routeOptions.queryFn,
      initialPageParam: routeOptions.initialPageParam,
      getNextPageParam: routeOptions.getNextPageParam,
    })
  }
}
