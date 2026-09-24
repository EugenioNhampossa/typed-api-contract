import { HTTP_METHOD, type AppRoute } from "../contract/index.js"
import { createRouteInfiniteQueryOptions } from "./createRouteInfiniteQueryOptions.js"
import { createRouteMutationOptions } from "./createRouteMutationOptions.js"
import { createRouteQueryOptions } from "./createRouteQueryOptions.js"

export function createRouteOptions(
  client: unknown,
  routePath: readonly string[],
  route: AppRoute,
): unknown {
  if (route.method === HTTP_METHOD.GET) {
    const optionsFactory = createRouteQueryOptions(client, routePath)
    if (route.infinite !== undefined) {
      const withInfinite = optionsFactory as typeof optionsFactory & {
        infinite: ReturnType<typeof createRouteInfiniteQueryOptions>
      }
      withInfinite.infinite = createRouteInfiniteQueryOptions(
        client,
        routePath,
        route,
      )
      return withInfinite
    }
    return optionsFactory
  }

  return createRouteMutationOptions(client, routePath)
}
