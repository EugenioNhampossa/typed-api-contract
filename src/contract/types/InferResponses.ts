import type { z, ZodType } from "zod"
import type { AppRoute } from "./AppRoute.js"

type StatusFromKey<K> = K extends `${infer Code extends number}` ? Code : K

/**
 * Union of `{ status, body }` for each declared response schema on `R`.
 *
 * `status` is the numeric key and `body` is the Zod output.
 */
export type InferResponses<R extends AppRoute> = {
  [K in keyof R["responses"]]: R["responses"][K] extends ZodType
    ? { status: StatusFromKey<K>; body: z.infer<R["responses"][K]> }
    : never
}[keyof R["responses"]]
