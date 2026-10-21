import type { z, ZodType } from "zod"
import type { AppRoute } from "./AppRoute.js"

/**
 * Body inferred from `R["body"]`, or `never` when the route has none.
 *
 * When `contentType` is `"multipart"`, the value is `z.infer<Schema> | FormData`.
 */
export type InferBody<R extends AppRoute> = R extends {
  body: infer Schema extends ZodType
}
  ? R extends { contentType: "multipart" }
    ? z.infer<Schema> | FormData
    : z.infer<Schema>
  : never
