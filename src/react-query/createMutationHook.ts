import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query"
import type { AppRoute, InferClientArgs, InferResponses } from "../contract/index.js"
import { callClientRoute } from "./callClientRoute.js"

export function createMutationHook<R extends AppRoute>(
  client: unknown,
  routePath: readonly string[],
): (
  options?: Omit<
    UseMutationOptions<InferResponses<R>, Error, InferClientArgs<R>>,
    "mutationFn"
  >,
) => UseMutationResult<InferResponses<R>, Error, InferClientArgs<R>> {
  return function useContractMutation(options) {
    return useMutation({
      ...options,
      mutationFn: (args: InferClientArgs<R>) =>
        callClientRoute(client, routePath, args) as Promise<InferResponses<R>>,
    })
  }
}
