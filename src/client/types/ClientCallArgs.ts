import type { AppRoute, InferClientArgs } from "../../contract/index.js"
import type { TransportArgs } from "./TransportArgs.js"

/**
 * Arguments for one route call: contract `params`, `query`, and `body`, plus
 * optional per-call {@link TransportArgs}.
 *
 * `headers` and `signal` are not part of the contract and are ignored by query keys.
 */
export type ClientCallArgs<R extends AppRoute> = InferClientArgs<R> &
  TransportArgs
