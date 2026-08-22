import type { AppRoute, InferResponses } from "../contract/index.js"
import { UnexpectedStatusError } from "./errors/UnexpectedStatusError.js"
import { isZodSchema } from "./isZodSchema.js"
import type { ClientResponse } from "./types/ClientInterceptor.js"

/**
 * Validates a mapped (or recovered) response against the route's declared statuses.
 */
export function parseRouteResponse<R extends AppRoute>(
  route: R,
  response: ClientResponse,
): InferResponses<R> {
  const schema: unknown = route.responses[response.status]
  if (!isZodSchema(schema)) {
    throw new UnexpectedStatusError({
      method: route.method,
      path: route.path,
      status: response.status,
    })
  }

  const parsedBody = schema.parse(response.body)
  return {
    status: response.status,
    body: parsedBody,
  } as InferResponses<R>
}
