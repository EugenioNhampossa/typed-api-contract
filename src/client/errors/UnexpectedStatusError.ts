import type { HttpMethod } from "../../contract/index.js"

interface UnexpectedStatusErrorParams {
  method: HttpMethod
  path: string
  status: number
}

export class UnexpectedStatusError extends Error {
  readonly method: HttpMethod
  readonly path: string
  readonly status: number

  constructor({ method, path, status }: UnexpectedStatusErrorParams) {
    super(`Unexpected status ${status} for ${method} ${path}`)
    this.name = "UnexpectedStatusError"
    this.method = method
    this.path = path
    this.status = status
  }
}
