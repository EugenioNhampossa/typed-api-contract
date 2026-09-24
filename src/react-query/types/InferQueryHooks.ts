import type {
  InfiniteData,
  UseInfiniteQueryResult,
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
import type { ContractClientError } from "./ContractClientError.js"

type QueryHookFn<R extends AppRoute> = <TData = InferResponses<R>>(
  args: ClientCallArgs<R>,
  options?: Omit<
    UseQueryOptions<InferResponses<R>, ContractClientError, TData>,
    "queryKey" | "queryFn"
  >,
) => UseQueryResult<TData, ContractClientError>

type InfiniteQueryHook<R extends AppRoute> = (
  args: ClientCallArgs<R>,
  options?: Record<string, unknown>,
) => UseInfiniteQueryResult<
  InfiniteData<InferResponses<R>>,
  ContractClientError
>

type QueryHook<R extends AppRoute> = QueryHookFn<R> &
  (R extends { infinite: object } ? { infinite: InfiniteQueryHook<R> } : unknown)

type MutationHook<R extends AppRoute> = (
  options?: Omit<
    UseMutationOptions<
      InferResponses<R>,
      ContractClientError,
      ClientCallArgs<R>
    >,
    "mutationFn"
  >,
) => UseMutationResult<
  InferResponses<R>,
  ContractClientError,
  ClientCallArgs<R>
>

export type InferQueryHooks<T extends AppRouter> = {
  [K in keyof T]: T[K] extends AppRoute
    ? T[K]["method"] extends GetHttpMethod
      ? QueryHook<T[K]>
      : MutationHook<T[K]>
    : T[K] extends AppRouter
      ? InferQueryHooks<T[K]>
      : never
}
