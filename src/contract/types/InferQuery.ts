import type { z, ZodType } from "zod"
import type { AppRoute } from "./AppRoute.js"

export type InferQuery<R extends AppRoute> = R extends {
  query: infer Schema extends ZodType
}
  ? z.infer<Schema>
  : never
