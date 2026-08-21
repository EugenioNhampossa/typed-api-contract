import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import type {
  AppRoute,
  AppRouter,
  GetHttpMethod,
  InferClientArgs,
  InferResponses,
} from "../../contract/index.js"

type QueryHook<R extends AppRoute> = <TData = InferResponses<R>>(
  args: InferClientArgs<R>,
  options?: Omit<
    UseQueryOptions<InferResponses<R>, Error, TData>,
    "queryKey" | "queryFn"
  >,
) => UseQueryResult<TData, Error>

type MutationHook<R extends AppRoute> = (
  options?: Omit<
    UseMutationOptions<InferResponses<R>, Error, InferClientArgs<R>>,
    "mutationFn"
  >,
) => UseMutationResult<InferResponses<R>, Error, InferClientArgs<R>>

export type InferQueryHooks<T extends AppRouter> = {
  [K in keyof T]: T[K] extends AppRoute
    ? T[K]["method"] extends GetHttpMethod
      ? QueryHook<T[K]>
      : MutationHook<T[K]>
    : T[K] extends AppRouter
      ? InferQueryHooks<T[K]>
      : never
}
