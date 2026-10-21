import type { HttpMethod } from "../../contract/index.js"

interface UnexpectedStatusErrorParams {
  method: HttpMethod
  path: string
  status: number
}

/**
 * Thrown by a route caller when the response status has no schema on the route.
 *
 * Declared statuses, including 4xx, are returned as `{ status, body }` instead.
 */
export class UnexpectedStatusError extends Error {
  /** Method of the route that was called. */
  readonly method: HttpMethod

  /** Path template of the route, including any `:param` placeholders. */
  readonly path: string

  /** HTTP status that was not declared on the route. */
  readonly status: number

  /**
   * @param params - Route method, path template, and the undeclared status.
   */
  constructor({ method, path, status }: UnexpectedStatusErrorParams) {
    super(`Unexpected status ${status} for ${method} ${path}`)
    this.name = "UnexpectedStatusError"
    this.method = method
    this.path = path
    this.status = status
  }
}
