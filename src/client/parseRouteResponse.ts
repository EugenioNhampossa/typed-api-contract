import type { AppRoute, InferResponses } from "../contract/index.js"
import { UnexpectedStatusError } from "./errors/UnexpectedStatusError.js"
import { isZodSchema } from "./isZodSchema.js"
import type { ClientResponse } from "./types/ClientInterceptor.js"

/**
 * Maps a response onto the route's declared statuses.
 *
 * When `validateResponse` is true, the body is parsed with that status schema.
 * A status with no schema throws {@link UnexpectedStatusError} either way.
 */
export function parseRouteResponse<R extends AppRoute>(
  route: R,
  response: ClientResponse,
  validateResponse: boolean,
): InferResponses<R> {
  const schema: unknown = route.responses[response.status]
  if (!isZodSchema(schema)) {
    throw new UnexpectedStatusError({
      method: route.method,
      path: route.path,
      status: response.status,
    })
  }

  const body = validateResponse ? schema.parse(response.body) : response.body
  return {
    status: response.status,
    body,
  } as InferResponses<R>
}
