import type { AppRoute, InferClientArgs, InferResponses } from "../contract/index.js"
import { callRoute } from "./callRoute.js"

export function createRouteCaller(
  baseUrl: string,
  route: AppRoute,
): (args: InferClientArgs<AppRoute>) => Promise<InferResponses<AppRoute>> {
  return (args: InferClientArgs<AppRoute>) => callRoute({ baseUrl, route, args })
}
