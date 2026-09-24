import { HTTP_METHOD, type AppRoute } from "../contract/index.js"
import { createInfiniteQueryHook } from "./createInfiniteQueryHook.js"
import { createMutationHook } from "./createMutationHook.js"
import { createQueryHook } from "./createQueryHook.js"

export function createRouteHook(
  client: unknown,
  routePath: readonly string[],
  route: AppRoute,
): unknown {
  if (route.method === HTTP_METHOD.GET) {
    const hook = createQueryHook(client, routePath)
    if (route.infinite !== undefined) {
      const withInfinite = hook as typeof hook & {
        infinite: ReturnType<typeof createInfiniteQueryHook>
      }
      withInfinite.infinite = createInfiniteQueryHook(client, routePath, route)
      return withInfinite
    }
    return hook
  }

  return createMutationHook(client, routePath)
}
