import type { AppRoute, AppRouter, InferResponses } from "../../contract/index.js"
import type { ClientCallArgs } from "./ClientCallArgs.js"

export type InferClient<T extends AppRouter> = {
  [K in keyof T]: T[K] extends AppRoute
    ? (args: ClientCallArgs<T[K]>) => Promise<InferResponses<T[K]>>
    : T[K] extends AppRouter
      ? InferClient<T[K]>
      : never
}
