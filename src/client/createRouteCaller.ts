import type { AppRoute, InferResponses } from "../contract/index.js"
import { callRoute } from "./callRoute.js"
import type { ClientCallArgs } from "./types/ClientCallArgs.js"
import type { ClientConfig } from "./types/ClientConfig.js"

export function createRouteCaller(
  config: ClientConfig,
  route: AppRoute,
): (args: ClientCallArgs<AppRoute>) => Promise<InferResponses<AppRoute>> {
  return (args: ClientCallArgs<AppRoute>) => callRoute({ config, route, args })
}
