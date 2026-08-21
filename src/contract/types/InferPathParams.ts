import type { z, ZodType } from "zod"
import type { AppRoute } from "./AppRoute.js"

export type InferPathParams<R extends AppRoute> = R extends {
  pathParams: infer Schema extends ZodType
}
  ? z.infer<Schema>
  : never
