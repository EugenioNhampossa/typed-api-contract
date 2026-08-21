import type { AppRoute } from "./AppRoute.js"

export type AppRouter = {
  [key: string]: AppRoute | AppRouter
}
