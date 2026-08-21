import type {
  AppRoute,
  AppRouter,
  InferClientArgs,
  InferResponses,
} from "../../contract/index.js"

export type InferClient<T extends AppRouter> = {
  [K in keyof T]: T[K] extends AppRoute
    ? (args: InferClientArgs<T[K]>) => Promise<InferResponses<T[K]>>
    : T[K] extends AppRouter
      ? InferClient<T[K]>
      : never
}
