/** HTTP methods a route can declare. */
export const HTTP_METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const

/** Any member of {@link HTTP_METHOD}. */
export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD]

/**
 * The `"GET"` method.
 *
 * GET routes become queries. Every other {@link HttpMethod} becomes a mutation.
 */
export type GetHttpMethod = (typeof HTTP_METHOD)["GET"]
