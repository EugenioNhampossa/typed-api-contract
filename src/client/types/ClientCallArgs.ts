import type { AppRoute, InferClientArgs } from "../../contract/index.js"
import type { TransportArgs } from "./TransportArgs.js"

export type ClientCallArgs<R extends AppRoute> = InferClientArgs<R> &
  TransportArgs
