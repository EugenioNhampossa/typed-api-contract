import type {
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query"
import type { ClientCallArgs } from "../../client/index.js"
import type {
  AppRoute,
  AppRouter,
  GetHttpMethod,
  InferResponses,
} from "../../contract/index.js"
import type { ContractClientError } from "./ContractClientError.js"

type QueryOptionsFactory<R extends AppRoute> = (
  args: ClientCallArgs<R>,
) => Omit<
  UseQueryOptions<InferResponses<R>, ContractClientError>,
  "queryKey" | "queryFn"
> & {
  queryKey: readonly unknown[]
  queryFn: (context: {
    signal: AbortSignal
  }) => Promise<InferResponses<R>>
}

type MutationOptionsFactory<R extends AppRoute> = () => Omit<
  UseMutationOptions<
    InferResponses<R>,
    ContractClientError,
    ClientCallArgs<R>
  >,
  "mutationFn"
> & {
  mutationFn: (args: ClientCallArgs<R>) => Promise<InferResponses<R>>
}

type InfiniteOptionsFactory<R extends AppRoute> = (
  args: ClientCallArgs<R>,
) => {
  queryKey: readonly unknown[]
  queryFn: (context: {
    signal: AbortSignal
    pageParam: unknown
  }) => Promise<InferResponses<R>>
  initialPageParam: unknown
  getNextPageParam: (
    lastPage: InferResponses<R>,
    allPages: InferResponses<R>[],
    lastPageParam: unknown,
    allPageParams: unknown[],
  ) => unknown
}

type QueryOptionsNode<R extends AppRoute> = QueryOptionsFactory<R> &
  (R extends { infinite: object }
    ? { infinite: InfiniteOptionsFactory<R> }
    : unknown)

/**
 * Options-factory tree matching a router.
 *
 * GET routes are `useQuery` option factories, plus `.infinite` when the route sets `infinite`.
 * Every other method is a `useMutation` options factory.
 */
export type InferQueryOptions<T extends AppRouter> = {
  [K in keyof T]: T[K] extends AppRoute
    ? T[K]["method"] extends GetHttpMethod
      ? QueryOptionsNode<T[K]>
      : MutationOptionsFactory<T[K]>
    : T[K] extends AppRouter
      ? InferQueryOptions<T[K]>
      : never
}
