import type { AppRoute } from "./types/AppRoute.js"
import { HTTP_METHOD, type HttpMethod } from "./types/HttpMethod.js"

const HTTP_METHOD_VALUES: ReadonlySet<string> = new Set(
  Object.values(HTTP_METHOD),
)

function isHttpMethod(value: unknown): value is HttpMethod {
  return typeof value === "string" && HTTP_METHOD_VALUES.has(value)
}

/**
 * Returns true when `value` looks like an {@link AppRoute} leaf (method, path, responses).
 *
 * @remarks
 * This is a structural check of `method`, `path`, and `responses`.
 * It does not Zod-parse the route or inspect `pathParams`, `query`, or `body`.
 */
export function isAppRoute(value: unknown): value is AppRoute {
  if (typeof value !== "object" || value === null) {
    return false
  }

  if (!("method" in value) || !("path" in value) || !("responses" in value)) {
    return false
  }

  const hasValidMethod = isHttpMethod(value.method)
  const hasValidPath = typeof value.path === "string"
  const hasResponses =
    typeof value.responses === "object" && value.responses !== null

  return hasValidMethod && hasValidPath && hasResponses
}
