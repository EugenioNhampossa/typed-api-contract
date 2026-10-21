import type { AppRoute } from "./AppRoute.js"

/** Nested route tree. Each value is an {@link AppRoute} leaf or another router. */
export type AppRouter = {
  [key: string]: AppRoute | AppRouter
}
