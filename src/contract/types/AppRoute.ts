import type { ZodType } from "zod"
import type { HttpMethod } from "./HttpMethod.js"

export type RouteContentType = "json" | "multipart"

export interface InfiniteRouteConfig {
  initialPageParam: unknown
  getNextPageParam: (
    lastPage: unknown,
    allPages: unknown[],
    lastPageParam: unknown,
    allPageParams: unknown[],
  ) => unknown
}

export interface AppRoute {
  method: HttpMethod
  path: string
  pathParams?: ZodType
  query?: ZodType
  body?: ZodType
  /**
   * Wire encoding for `body`. Defaults to `"json"`.
   * `"multipart"` builds `FormData` and never sets `Content-Type`.
   */
  contentType?: RouteContentType
  /**
   * When set on a GET route, enables infinite query options / hooks.
   */
  infinite?: InfiniteRouteConfig
  responses: Record<number, ZodType>
}

