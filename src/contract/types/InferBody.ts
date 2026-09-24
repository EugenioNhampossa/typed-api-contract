import type { z, ZodType } from "zod"
import type { AppRoute } from "./AppRoute.js"

export type InferBody<R extends AppRoute> = R extends {
  body: infer Schema extends ZodType
}
  ? R extends { contentType: "multipart" }
    ? z.infer<Schema> | FormData
    : z.infer<Schema>
  : never
