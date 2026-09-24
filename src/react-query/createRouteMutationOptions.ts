import { mutationOptions } from "@tanstack/react-query"
import type { ClientCallArgs } from "../client/index.js"
import type { AppRoute, InferResponses } from "../contract/index.js"
import { callClientRoute } from "./callClientRoute.js"
import type { ContractClientError } from "./types/ContractClientError.js"

/**
 * Builds TanStack `mutationOptions` for a non-GET route.
 */
export function createRouteMutationOptions<R extends AppRoute>(
  client: unknown,
  routePath: readonly string[],
) {
  return () =>
    mutationOptions<
      InferResponses<R>,
      ContractClientError,
      ClientCallArgs<R>
    >({
      mutationFn: (args: ClientCallArgs<R>) =>
        callClientRoute(client, routePath, args) as Promise<InferResponses<R>>,
    })
}
