import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query"
import type { ClientCallArgs } from "../client/index.js"
import type { AppRoute, InferResponses } from "../contract/index.js"
import { createRouteQueryOptions } from "./createRouteQueryOptions.js"
import type { ContractClientError } from "./types/ContractClientError.js"

export function createQueryHook<R extends AppRoute>(
  client: unknown,
  routePath: readonly string[],
): <TData = InferResponses<R>>(
  args: ClientCallArgs<R>,
  options?: Omit<
    UseQueryOptions<InferResponses<R>, ContractClientError, TData>,
    "queryKey" | "queryFn"
  >,
) => UseQueryResult<TData, ContractClientError> {
  const getOptions = createRouteQueryOptions<R>(client, routePath)

  return function useContractQuery(args, options) {
    const routeOptions = getOptions(args)
    return useQuery({
      ...options,
      queryKey: routeOptions.queryKey,
      queryFn: routeOptions.queryFn,
    })
  }
}
