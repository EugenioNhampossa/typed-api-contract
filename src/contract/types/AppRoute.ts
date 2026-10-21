import type { ZodType } from "zod"
import type { HttpMethod } from "./HttpMethod.js"

/** Body encoding for an {@link AppRoute}: `"json"` or `"multipart"`. */
export type RouteContentType = "json" | "multipart"

/**
 * Cursor config that turns a GET route into an infinite query.
 *
 * Page params are plain objects merged into the route `query`
 * (for example `{ cursor }`).
 */
export interface InfiniteRouteConfig {
  /** Page param passed into the first request's `query`. */
  initialPageParam: unknown

  /**
   * Returns the next page param, or `undefined` when there is no next page.
   *
   * `lastPage` is the parsed `{ status, body }` response. The returned object
   * is merged into `query` for the following request.
   */
  getNextPageParam: (
    lastPage: unknown,
    allPages: unknown[],
    lastPageParam: unknown,
    allPageParams: unknown[],
  ) => unknown
}

/**
 * One HTTP endpoint: method, path, optional Zod inputs, and response schemas.
 */
export interface AppRoute {
  /** HTTP method. Use `HTTP_METHOD`. */
  method: HttpMethod

  /**
   * Path beginning with `/`, with optional `:param` placeholders.
   *
   * Every `:param` must match a key of {@link AppRoute.pathParams}, and every
   * `pathParams` key must appear in the path. `initClient` throws `Error`
   * when they disagree.
   */
  path: string

  /**
   * Zod object schema for `:param` values.
   *
   * Omit when {@link AppRoute.path} has no placeholders. Keys must match
   * those placeholder names.
   */
  pathParams?: ZodType

  /** Zod schema for the query string. Omit when the route has no query. */
  query?: ZodType

  /**
   * Zod schema for the request body.
   *
   * Omit when the route sends no body. With `contentType: "multipart"`,
   * callers may pass the inferred object or a `FormData` instance.
   */
  body?: ZodType

  /**
   * Wire encoding for `body`. Defaults to `"json"`.
   * `"multipart"` builds `FormData` and never sets `Content-Type`.
   *
   * A multipart body may be a plain object or a ready `FormData` instance.
   *
   * @defaultValue `"json"`
   */
  contentType?: RouteContentType

  /**
   * When set on a GET route, enables infinite query options and hooks.
   *
   * Page params are plain objects merged into `query`. The route then exposes
   * `.infinite` on its query hook and query options.
   */
  infinite?: InfiniteRouteConfig

  /**
   * Zod schemas keyed by HTTP status.
   *
   * Declared statuses, including 4xx, are successful data shaped as
   * `{ status, body }`. A status with no schema throws `UnexpectedStatusError`
   * from the route caller. Empty bodies use `z.void()` or `z.undefined()`
   * (for example 204).
   */
  responses: Record<number, ZodType>
}
