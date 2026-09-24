import {
  infiniteQueryOptions,
  type InfiniteData,
} from "@tanstack/react-query"
import type { ClientCallArgs } from "../client/index.js"
import { combineAbortSignals } from "../client/combineAbortSignals.js"
import type { AppRoute, InferResponses } from "../contract/index.js"
import { buildQueryKey } from "./buildQueryKey.js"
import { callClientRoute } from "./callClientRoute.js"
import type { ContractClientError } from "./types/ContractClientError.js"

/**
 * Builds TanStack `infiniteQueryOptions` for a GET route with `infinite` config.
 */
export function createRouteInfiniteQueryOptions<R extends AppRoute>(
  client: unknown,
  routePath: readonly string[],
  route: R,
) {
  const infinite = route.infinite
  if (infinite === undefined) {
    throw new Error(
      `Route ${route.method} ${route.path} has no infinite config`,
    )
  }

  return (args: ClientCallArgs<R>) =>
    infiniteQueryOptions<
      InferResponses<R>,
      ContractClientError,
      InfiniteData<InferResponses<R>>,
      ReturnType<typeof buildQueryKey>,
      unknown
    >({
      queryKey: buildQueryKey(routePath, args),
      initialPageParam: infinite.initialPageParam,
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
        infinite.getNextPageParam(
          lastPage as { status: number; body: unknown },
          allPages as { status: number; body: unknown }[],
          lastPageParam,
          allPageParams,
        ),
      queryFn: ({ signal, pageParam }) => {
        const query = mergePageParam(args.query, pageParam)
        return callClientRoute(client, routePath, {
          ...args,
          query,
          signal: combineAbortSignals(args.signal, signal),
        }) as Promise<InferResponses<R>>
      },
    })
}

function mergePageParam(query: unknown, pageParam: unknown): unknown {
  if (pageParam === undefined || pageParam === null) {
    return query
  }

  if (typeof pageParam !== "object" || Array.isArray(pageParam)) {
    throw new TypeError(
      "infinite pageParam must be a plain object merged into query (e.g. { cursor })",
    )
  }

  return {
    ...(typeof query === "object" && query !== null && !Array.isArray(query)
      ? query
      : {}),
    ...pageParam,
  }
}
