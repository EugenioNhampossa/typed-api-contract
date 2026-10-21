import type { z, ZodType } from "zod"
import type { AppRoute } from "./AppRoute.js"

/** Query inferred from `R["query"]`, or `never` when the route has none. */
export type InferQuery<R extends AppRoute> = R extends {
  query: infer Schema extends ZodType
}
  ? z.infer<Schema>
  : never
