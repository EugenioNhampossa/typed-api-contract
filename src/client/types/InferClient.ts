import type { AppRoute, AppRouter, InferResponses } from "../../contract/index.js"
import type { ClientCallArgs } from "./ClientCallArgs.js"

/**
 * Nested functions matching a router.
 *
 * Each leaf takes {@link ClientCallArgs} and returns a promise of that route's {@link InferResponses}.
 */
export type InferClient<T extends AppRouter> = {
  [K in keyof T]: T[K] extends AppRoute
    ? (args: ClientCallArgs<T[K]>) => Promise<InferResponses<T[K]>>
    : T[K] extends AppRouter
      ? InferClient<T[K]>
      : never
}
