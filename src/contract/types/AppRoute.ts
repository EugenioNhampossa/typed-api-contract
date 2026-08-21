import type { ZodType } from "zod"
import type { HttpMethod } from "./HttpMethod.js"

export interface AppRoute {
  method: HttpMethod
  path: string
  pathParams?: ZodType
  query?: ZodType
  body?: ZodType
  responses: Record<number, ZodType>
}
