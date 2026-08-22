import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import type { ClientCallArgs } from "../../client/index.js"
import type {
  AppRoute,
  AppRouter,
  GetHttpMethod,
  InferResponses,
} from "../../contract/index.js"

type QueryHook<R extends AppRoute> = <TData = InferResponses<R>>(
  args: ClientCallArgs<R>,
  options?: Omit<
    UseQueryOptions<InferResponses<R>, Error, TData>,
    "queryKey" | "queryFn"
  >,
) => UseQueryResult<TData, Error>

type MutationHook<R extends AppRoute> = (
  options?: Omit<
    UseMutationOptions<InferResponses<R>, Error, ClientCallArgs<R>>,
    "mutationFn"
  >,
) => UseMutationResult<InferResponses<R>, Error, ClientCallArgs<R>>

export type InferQueryHooks<T extends AppRouter> = {
  [K in keyof T]: T[K] extends AppRoute
    ? T[K]["method"] extends GetHttpMethod
      ? QueryHook<T[K]>
      : MutationHook<T[K]>
    : T[K] extends AppRouter
      ? InferQueryHooks<T[K]>
      : never
}
