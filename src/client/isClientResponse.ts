import type { ClientResponse } from "./types/ClientInterceptor.js"

/**
 * Returns true when `value` looks like a mapped client response.
 */
export function isClientResponse(value: unknown): value is ClientResponse {
  if (typeof value !== "object" || value === null) {
    return false
  }

  if (!("status" in value) || !("body" in value)) {
    return false
  }

  if (!("headers" in value) || !("raw" in value)) {
    return false
  }

  return (
    typeof value.status === "number" &&
    value.headers instanceof Headers &&
    value.raw instanceof Response
  )
}
