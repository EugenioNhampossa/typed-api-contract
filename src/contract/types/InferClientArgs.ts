import type { AppRoute } from "./AppRoute.js"
import type { InferBody } from "./InferBody.js"
import type { InferPathParams } from "./InferPathParams.js"
import type { InferQuery } from "./InferQuery.js"

type ClientArg<Name extends string, Value> = [Value] extends [never]
  ? { [Key in Name]?: never }
  : { [Key in Name]: Value }

/**
 * Call arguments for a route: `params`, `query`, and `body` when those schemas exist.
 *
 * A missing schema becomes `{ key?: never }`, so passing that key is a type error
 * rather than an optional field.
 */
export type InferClientArgs<R extends AppRoute> = ClientArg<
  "params",
  InferPathParams<R>
> &
  ClientArg<"query", InferQuery<R>> &
  ClientArg<"body", InferBody<R>>
