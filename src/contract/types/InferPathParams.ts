import type { z, ZodType } from "zod"
import type { AppRoute } from "./AppRoute.js"

/** Path params inferred from `R["pathParams"]`, or `never` when the route has none. */
export type InferPathParams<R extends AppRoute> = R extends {
  pathParams: infer Schema extends ZodType
}
  ? z.infer<Schema>
  : never
