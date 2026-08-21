import { HTTP_METHOD, type AppRoute } from "../contract/index.js"
import { createMutationHook } from "./createMutationHook.js"
import { createQueryHook } from "./createQueryHook.js"

export function createRouteHook(
  client: unknown,
  routePath: readonly string[],
  route: AppRoute,
): unknown {
  if (route.method === HTTP_METHOD.GET) {
    return createQueryHook(client, routePath)
  }

  return createMutationHook(client, routePath)
}
