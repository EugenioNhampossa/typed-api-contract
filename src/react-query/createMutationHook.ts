import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query"
import type { ClientCallArgs } from "../client/index.js"
import type { AppRoute, InferResponses } from "../contract/index.js"
import { callClientRoute } from "./callClientRoute.js"

export function createMutationHook<R extends AppRoute>(
  client: unknown,
  routePath: readonly string[],
): (
  options?: Omit<
    UseMutationOptions<InferResponses<R>, Error, ClientCallArgs<R>>,
    "mutationFn"
  >,
) => UseMutationResult<InferResponses<R>, Error, ClientCallArgs<R>> {
  return function useContractMutation(options) {
    return useMutation({
      ...options,
      mutationFn: (args: ClientCallArgs<R>) =>
        callClientRoute(client, routePath, args) as Promise<InferResponses<R>>,
    })
  }
}
