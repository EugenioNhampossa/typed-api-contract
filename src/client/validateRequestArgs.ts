import type { AppRoute } from "../contract/index.js"
import { getRecordValue } from "./getRecordValue.js"
import { isZodSchema } from "./isZodSchema.js"
import type { ClientCallArgs } from "./types/ClientCallArgs.js"

/**
 * Parses `params`, `query`, and `body` with the route's Zod schemas when present.
 */
export function validateRequestArgs<R extends AppRoute>(
  route: R,
  args: ClientCallArgs<R>,
): void {
  if (isZodSchema(route.pathParams)) {
    route.pathParams.parse(getRecordValue(args, "params"))
  }

  if (isZodSchema(route.query)) {
    route.query.parse(getRecordValue(args, "query"))
  }

  if (isZodSchema(route.body)) {
    route.body.parse(getRecordValue(args, "body"))
  }
}
