import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query"
import type { ClientCallArgs } from "../client/index.js"
import type { AppRoute, InferResponses } from "../contract/index.js"
import { createRouteMutationOptions } from "./createRouteMutationOptions.js"
import type { ContractClientError } from "./types/ContractClientError.js"

export function createMutationHook<R extends AppRoute>(
  client: unknown,
  routePath: readonly string[],
): (
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
> {
  const getOptions = createRouteMutationOptions<R>(client, routePath)

  return function useContractMutation(options) {
    const routeOptions = getOptions()
    return useMutation({
      ...options,
      mutationFn: routeOptions.mutationFn,
    })
  }
}
